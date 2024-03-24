import { of, interval } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, catchError, switchMap } from 'rxjs/operators';

export default class Messages {
  constructor(element) {
    this.parentElement = element;
    this.messagesElement = this.parentElement.querySelector('.messages_list');
    this.url = 'https://ahj-rxjs-backend-jjts.onrender.com';
  }

  init() {
    const data$ = interval(5000).pipe(
      switchMap(() => ajax(`${this.url}/messages/unread`).pipe(
        map((userResponse) => userResponse.response),
        catchError(() => of({ timestamp: Date.now(), messages: [] })),
      )),
    );
    data$.subscribe((result) => {
      const resultData = result || { timestamp: Date.now(), messages: [] };
      for (const message of resultData.messages) {
        this.addMessage(this.formatData(message));
      }
    });
  }

  formatData(data) {
    const messageElement = document.createElement('li');
    messageElement.classList.add('messages_item');
    const emailElement = document.createElement('div');
    emailElement.classList.add('messages_email');
    emailElement.innerText = data.from;
    const subjectElement = document.createElement('div');
    subjectElement.classList.add('messages_subject');
    if (data.subject.length > 15) {
      subjectElement.innerText = `${data.subject.substr(0, 15).trim()}...`;
    } else {
      subjectElement.innerText = data.subject;
    }
    const dataElement = document.createElement('div');
    dataElement.classList.add('messages_date');
    const dateFormat = new Date(data.received);
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions = { minute: '2-digit', hour: '2-digit' };
    dataElement.innerText = `${dateFormat.toLocaleString('ru-RU', timeOptions)} ${dateFormat.toLocaleString('ru-RU', dateOptions)}`;
    messageElement.append(emailElement, subjectElement, dataElement);
    return messageElement;
  }

  addMessage(message) {
    this.messagesElement.prepend(message);
  }
}
