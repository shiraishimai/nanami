'use strict';
const isFunction = require('lodash/isFunction');
class Seed {
    constructor() {
        this.__paramInstances = void 0;    // Disabled
        this.__param = Array.prototype.slice.call(arguments);
    }
    * [Symbol.iterator]() {
        const param = this.__param,
            paramInstances = this.__paramInstances,
            iteration = function* (input, index){
                if (!input || !input.length || !input.match(/{[^}]*}/)) {
                    if (paramInstances) paramInstances[0] = input;
                    yield input;
                    return;
                }
                index = index || 1;
                // integerGenerator/charGenerator are functions that produce generator
                let generator = isFunction(param[index]) ? param[index]() : param[index],
                    nextIteration = function* (seed){
                        // Loop through parameters
                        yield* iteration(input.replace(/{[^}]*}/, seed), index+1);
                    };
                if (generator) {
                    for (let seed of generator) {
                        if (paramInstances) paramInstances[index] = seed;
                        yield* nextIteration(seed);
                    }
                } else {
                    yield* nextIteration("");
                }
            };
        // Loop through parameters
        yield* iteration(param[0]);
    }
    getIterator() {
        return this[Symbol.iterator]();
    }
    each(delegate) {
        if (!isFunction(delegate)) return;
        this.activateParamInstance();
        for (let _ of this[Symbol.iterator]()) {
            delegate.apply(this, this.__paramInstances);
        }
        this.deactivateParamInstance();
    }
    map(delegate) {
        if (!isFunction(delegate)) return;
        const result = [];
        this.activateParamInstance();
        for (let _ of this[Symbol.iterator]()) {
            result.push(delegate.apply(this, this.__paramInstances));
        }
        this.deactivateParamInstance();
        return result;
    }
    applyParamInstances(delegate) {
        if (!isFunction(delegate)) return;
        return delegate.apply(this, this.__paramInstances);
    }
    activateParamInstance() {
        this.__paramInstances = []; // Enable paramInstances to store intermediate state of generators
    }
    deactivateParamInstance() {
        this.__paramInstances = void 0;  // Disabling & release memory
    }
    next() {
        if (!this.iterator) {
            this.iterator = this[Symbol.iterator]();
        }
        const nextIterate = this.iterator.next();
        return nextIterate && nextIterate.value;
    }
    match(input) {
        const regex = this.__param[0];
        if (!regex || !(regex instanceof RegExp)) {
            return this;
        }
    }
    static integerGenerator(limit = 0, start) {
        return function* () {
            const base = start || 0;
            let i = 0;
            while (i < limit) yield base + i++;
        };
    }
    static charGenerator(limit = 0, startChar) {
        return function* () {
            const base = startChar && startChar.charCodeAt(0) || 'a'.charCodeAt(0);
            let i = 0;
            while (i < limit) yield String.fromCharCode(base + i++);
        };
    }
    static eachSequentialProcess(seed, processDelegate) {
        if (!isFunction(processDelegate)) return Promise.reject('processDelegate is not a function');
        const iterator = seed.getIterator && seed.getIterator() || seed[Symbol.iterator](),
            recursiveExecute = (accumulatedResult = []) => {
                if (iterator.next().value) {
                    return seed.applyParamInstances(processDelegate).then(result => {
                        return accumulatedResult.concat({
                            'success': true,
                            'result': result
                        });
                    }).catch(error => {
                        return accumulatedResult.concat({
                            'success': false,
                            'result': error
                        });
                    }).then(recursiveExecute);
                }
                return Promise.resolve(accumulatedResult);
            };
        seed.activateParamInstance();
        return recursiveExecute().then(result => {
            seed.deactivateParamInstance();
            return result;
        });
    }
    static eachBatchProcess(seed, processDelegate) {
        if (!isFunction(processDelegate)) return Promise.reject('processDelegate is not a function');
        const iterator = seed.getIterator && seed.getIterator() || seed[Symbol.iterator](),
            promises = [];
        seed.activateParamInstance();
        while (iterator.next().value) {
            promises.push(seed.applyParamInstances(processDelegate).then(result => {
                return {
                    'success': true,
                    'result': result
                };
            }).catch(error => {
                return {
                    'success': false,
                    'result': error
                };
            }));
        }
        seed.deactivateParamInstance();
        return Promise.all(promises);
    }
}
module.exports = Seed;