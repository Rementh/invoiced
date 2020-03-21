import { Component, Output, EventEmitter, Input } from '@angular/core';
import { wait, now } from 'src/utils/time';

@Component({
    selector: 'async-button',
    templateUrl: './async-button.component.html',
    styleUrls: ['./async-button.component.scss'],
})
export default class AsyncButtonComponent {
    private minDelay = 400;
    public isLoading = false;

    @Input() label: string;
    @Input() job: () => Promise<any>;
    @Output() done: EventEmitter<any> = new EventEmitter();

    async handleClick() {
        this.isLoading = true;

        const startTime = now();
        const result = await this.job();
        const timeLeft = this.minDelay - now() + startTime;
        if (timeLeft > 0) {
            await wait(timeLeft);
        }
        this.done.emit(result);

        this.isLoading = false;
    }
}
