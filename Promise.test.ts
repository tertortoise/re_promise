import {PromiseSimulation, resolverFunctionType, executorFunctionType} from "./Promise";

describe('PromiseSimulation instantiation is correct', () => {
    const executorMock = jest.fn() as jest.MockedFunction<() => void>;
    executorMock.mockImplementation(() => {});
    const promiseInstance = new PromiseSimulation(executorMock);

    test('instance is PromiseSimulation', () => {
        expect(promiseInstance).toBeInstanceOf(PromiseSimulation);
    })
    test('executor is called upon instantiation', () => {
        expect(executorMock).toHaveBeenCalledTimes(1);
    })
})

describe('PromiseSimulation then/catch functionality check',  () => {

    test('PromiseSimulation then callback is called with correct value and 2 then callbacks on the same instance are handled correctly',  (done) => {
        const executorMock = jest.fn() as jest.MockedFunction<executorFunctionType>;
        const thenCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        const catchCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        executorMock.mockImplementation((resolve) => {
            resolve('resolvedValue');
        });
        thenCallbackMock.mockImplementation((value) => {
            expect(value).toBe('other value');
            expect(thenCallbackMock).toBeCalledTimes(2);
            done();
        })
        const promiseInstance = new PromiseSimulation(executorMock);
        promiseInstance.then(thenCallbackMock);
        promiseInstance.then(() => thenCallbackMock('other value'));
    });

    test('async resolution / sync then is handled correctly',  (done) => {
        const executorMock = jest.fn() as jest.MockedFunction<executorFunctionType>;
        const thenCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        const catchCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        executorMock.mockImplementation((resolve) => {
            setTimeout(() => {
                resolve('resolvedValue');
            }, 1000)
        });
        thenCallbackMock.mockImplementation((value) => {
            expect(value).toBe('resolvedValue');
            expect(thenCallbackMock).toBeCalledTimes(1);
            done();
        })
        const promiseInstance = new PromiseSimulation(executorMock);
        promiseInstance.then(thenCallbackMock);
    })

    test('sync resolution / async then is handled correctly',  (done) => {
        const executorMock = jest.fn() as jest.MockedFunction<executorFunctionType>;
        const thenCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        const catchCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        executorMock.mockImplementation((resolve) => {
                resolve('resolvedValue');
        });
        thenCallbackMock.mockImplementation((value) => {
            expect(value).toBe('resolvedValue');
            expect(thenCallbackMock).toBeCalledTimes(1);
            done();
        })
        const promiseInstance = new PromiseSimulation(executorMock);
        setTimeout(() => {
            promiseInstance.then(thenCallbackMock);
        }, 1000)
    })

    test('catch is handled correctly upon reject in executor',  (done) => {
        const catchCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        catchCallbackMock.mockImplementation((value) => {
            expect(value).toBe('rejectedValue');
            expect(catchCallbackMock).toBeCalledTimes(1);
            done();
        })
        const promiseInstance = new PromiseSimulation((resolve, reject) => {
            reject('rejectedValue');
        });
        promiseInstance.catch(catchCallbackMock);
    })

    test('catch is handled correctly upon throw in executor',  (done) => {
        const catchCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>;
        catchCallbackMock.mockImplementation((value) => {
            expect(value.message).toBe('ERROR_THROWN');
            expect(catchCallbackMock).toBeCalledTimes(1);
            done();
        })
        const promiseInstance = new PromiseSimulation((resolve, reject) => {
            throw new Error('ERROR_THROWN');
        });
        promiseInstance.catch(catchCallbackMock);
    })

})

describe('PromiseSimulation then / catch chaining',  () => {

    test('returns a PromiseSimulation instance',  (done) => {
        const thenCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>
        const promiseInstance = new PromiseSimulation((resolve) => {
            setTimeout(() => {
                resolve('resolvedValue');
            }, 1000)
        });
        const newPromise = promiseInstance.then(() => {});
        expect(newPromise).toBeInstanceOf(PromiseSimulation);
        done();
    })

    test('returned PromiseSimulation instance correctly handles resolved value',  (done) => {
        const thenCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>
        thenCallbackMock.mockImplementation((value) => {
            expect(value).toBe('resolvedValue');
            expect(thenCallbackMock).toBeCalledTimes(1);
            done();
        })
        const promiseInstance = new PromiseSimulation((resolve) => {
            setTimeout(() => {
                resolve('resolvedValue');
            }, 1000)
        });
        promiseInstance.then((value) => value).then(thenCallbackMock)
    })

    test('then after catch handles returned value correctly',  (done) => {
        const thenCallbackMock = jest.fn() as jest.MockedFunction<(value: any) => void>
        const valueFromCatch = 'VALUE_FROM_CATCH';
        thenCallbackMock.mockImplementation((value) => {
            expect(value).toBe(valueFromCatch);
            done();
        })
        const promiseInstance = new PromiseSimulation((resolve, reject) => {
            reject('INITIAL_REJECT_VALUE');
        });
        promiseInstance.catch((v) => valueFromCatch).then(thenCallbackMock)
    })

})

