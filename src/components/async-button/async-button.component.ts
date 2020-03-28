import { Component, Output, EventEmitter, Input } from '@angular/core';
import { wait, now } from 'src/utils/time';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'async-button',
    templateUrl: './async-button.component.html',
    styleUrls: ['./async-button.component.scss'],
})
export default class AsyncButtonComponent {
    private minDelay = 400;
    public isLoading = false;

    @Input() label: string;
    @Input() job: () => Observable<any>;
    @Output() success: EventEmitter<any> = new EventEmitter();
    @Output() error: EventEmitter<any> = new EventEmitter();

    handleClick() {
        this.isLoading = true;
        const startTime = now();

        this.job()
            .pipe(catchError(jobError => of({ jobError })))
            .subscribe(async result => {
                const output = result?.jobError || result;
                const emitter = result?.jobError ? this.error : this.success;
                const timeLeft = this.minDelay - now() + startTime;

                if (timeLeft > 0) {
                    await wait(timeLeft);
                }
                emitter.emit(output);

                this.isLoading = false;
            });
    }
}
