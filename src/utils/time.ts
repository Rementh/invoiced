import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export const wait = (time: number): Promise<any> =>
    of()
        .pipe(delay(time))
        .toPromise();

export const now = () => new Date().getTime();
