'use strict';
let _ = require('lodash'),
    Util = require('misa'),
    path = require('path'),
    fs = require('fs');
class Seed {
    constructor() {
        this.__paramInstances = void 0;    // Disabled
        this.__param = Array.prototype.slice.call(arguments);
    }
    * [Symbol.iterator]() {
        let param = this.__param,
            paramInstances = this.__paramInstances,
            iteration = function* (input, index){
                if (!input.match(/{[^}]*}/)) {
                    if (paramInstances) paramInstances[0] = input;
                    yield input;
                    return;
                }
                index = index || 1;
                let generator = _.isFunction(param[index]) ? param[index]() : param[index],
                    nextIteration = function* (seed){
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
        yield* iteration(param[0]);
    }
    getIterator() {
        return this[Symbol.iterator]();
    }
    each(delegate) {
        if (!_.isFunction(delegate)) return;
        this.activateParamInstance();
        for (let seed of this[Symbol.iterator]()) {
            delegate.apply(this, this.__paramInstances);
        }
        this.deactivateParamInstance();
    }
    applyParamInstances(delegate) {
        if (!_.isFunction(delegate)) return;
        return delegate.apply(this, this.__paramInstances);
    }
    activateParamInstance() {
        this.__paramInstances = []; // Enable paramInstances to store intermediate state of generators
    }
    deactivateParamInstance() {
        this.__paramInstances = void 0;  // Disabling & release memory
    }
    static integerGenerator(limit = 0, start) {
        return function* () {
            let base = start || 0,
                i = 0;
            while (i < limit) yield base + i++;
        };
    }
    static charGenerator(limit = 0, startChar) {
        return function* () {
            let base = startChar && startChar.charCodeAt(0) || 'a'.charCodeAt(0),
                i = 0;
            while (i < limit) yield String.fromCharCode(base + i++);
        };
    }
    static eachSequentialProcess(seed, processDelegate) {
        if (!_.isFunction(processDelegate)) return Promise.reject('processDelegate is not a function');
        let iterator = seed.getIterator && seed.getIterator() || seed[Symbol.iterator](),
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
                return accumulatedResult;
            };
        seed.activateParamInstance();
        return recursiveExecute().then(result => {
            seed.deactivateParamInstance();
            return result;
        });
    }
    static eachBatchProcess(seed, processDelegate) {
        if (!_.isFunction(processDelegate)) return Promise.reject('processDelegate is not a function');
        let iterator = seed.getIterator && seed.getIterator() || seed[Symbol.iterator](),
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
    /**
     * options.hierarchy = true will have better performance
     * 
     * @param  {[Object]} options         [config]
     *         @param  {[String]} dir         [directory to execute]
     *         @param  {[Boolean]} hierarchy=false         [whether to return a hierarchy or flattened array]
     * @param  {[Function]} promiseDelegate [iteration function]
     *         @param  {[String]} file [path resolution of file]
     *         @return {[Promise]}
     * @return {[Promise]}
     */
    static recursiveReadDirPromise(options, promiseDelegate) {
        if (!_.isObject(options)) return Promise.reject("[recursiveReadDirPromise] Input error");
        let dir = options.dir,
            keepHierarchy = options.hierarchy;
        if (!dir || !_.isString(dir)) return Promise.reject("[recursiveReadDirPromise] Input error");
        if (!Util.isDirectoryExist(dir)) return Promise.reject("[recursiveReadDirPromise] Directory doesn't exist");
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, list) => {
                if (err) return reject(err);
                let promises = [],
                    target;
                for (let file of list) {
                    target = path.resolve(dir, file);
                    if (Util.isFileExist(target)) {
                        promises.push(promiseDelegate(target));
                    } else if (Util.isDirectoryExist(target)) {
                        promises.push(Seed.recursiveReadDirPromise(_.merge({}, options, {
                            "dir": target
                        }), promiseDelegate));
                    }
                }
                return resolve(Promise.all(promises).then(results => keepHierarchy ? results : _.flattenDeep(results)));
            });
        });
    }
}
module.exports = Seed;