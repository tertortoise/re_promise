export type resolverFunctionType = (resolvedValue: any) => void;
export type executorFunctionType = (resolver: resolverFunctionType, rejector: resolverFunctionType) => void;
export type thenCallbackType = (value: any) => any;

export class PromiseSimulation {

    private _resolved: boolean = false;
    private _resolvedValue: any;
    private _thenCallbacks: resolverFunctionType[] = [];
    private _catchCallbacks: resolverFunctionType[] = [];
    private _rejected: boolean = false;
    private _rejectedValue: any;

    constructor(executor: executorFunctionType) {
        try {
            executor(this._resolver, this._rejector);
        } catch (error) {
            this._rejector(error)
        }
    }

    private _resolver: resolverFunctionType = (resolvedValue: any) => {
        if (resolvedValue instanceof PromiseSimulation) {
            resolvedValue.then(value => {
                this._resolved = true;
                this._resolvedValue = value;
                this._thenHandler();
            })
        } else {
            this._resolved = true;
            this._resolvedValue = resolvedValue;
            this._thenHandler();
        }
    }

    private _rejector: resolverFunctionType = (rejectedValue: any) => {
        if (rejectedValue instanceof PromiseSimulation) {
            rejectedValue.then(value => {
                this._resolved = true;
                this._resolvedValue = value;
                this._thenHandler();
            })
        } else {
            this._rejected = true;
            this._rejectedValue = rejectedValue;
            this._catchHandler();
        }
    }

    private _thenHandler(): void {
        this._resolved && this._thenCallbacks.length && queueMicrotask(() => {
            this._thenCallbacks.forEach(_thenCallback => _thenCallback(this._resolvedValue));
            this._thenCallbacks = [];
        })
    }

    private _catchHandler(): void {
        this._rejected && this._catchCallbacks.length && queueMicrotask(() => {
            this._catchCallbacks.forEach(_catchCallback => _catchCallback(this._rejectedValue));
            this._catchCallbacks = [];
        })
    }

    public then(thenCallback: thenCallbackType): PromiseSimulation {
        const nextInstance = new PromiseSimulation((resolve, reject) => {
            this._thenCallbacks.push((resolvedValue) => {
                try {
                    resolve(thenCallback(resolvedValue));
                } catch (e) {
                    reject(e)
                }

            });
        })
        this._thenHandler();
        return nextInstance;
    }

    public catch(catchCallback: thenCallbackType): PromiseSimulation {
        const nextInstance = new PromiseSimulation((resolve, reject) => {
            this._catchCallbacks.push((resolvedValue) => {
                try {
                    resolve(catchCallback(resolvedValue));
                } catch (e) {
                    reject(e)
                }
            });
        })
        this._catchHandler();
        return nextInstance;
    }
}


