const expect = require('chai').expect,
    Nanami = require("./Seed.js");

describe('integerGenerator', () => {
    it('with default param', () => {
        const generator = Nanami.integerGenerator(),
            result = generator().next().value;
        expect(generator.constructor.name).to.equal('GeneratorFunction');
        expect(result).to.equal(void 0);
    });
    it('returns 3 integers', () => {
        const iterator = Nanami.integerGenerator(3)();
        for (let i = 0, result; i < 3; i++) {
            result = iterator.next().value;
            expect(result).to.be.a('number');
            expect(result).to.equal(i);
        }
    });
    it('returns 3 integers from 10', () => {
        const iterator = Nanami.integerGenerator(3, 10)();
        for (let i = 0, result; i < 3; i++) {
            result = iterator.next().value;
            expect(result).to.be.a('number');
            expect(result).to.equal(i+10);
        }
    });
});
describe('charGenerator', () => {
    it('with default param', () => {
        const generator = Nanami.charGenerator(),
            result = generator().next().value;
        expect(generator.constructor.name).to.equal('GeneratorFunction');
        expect(result).to.equal(void 0);
    });
    it('returns 3 characters', () => {
        const iterator = Nanami.charGenerator(3)();
        for (let i = 'a'.charCodeAt(), result; i < 3; i++) {
            result = iterator.next().value;
            expect(result).to.be.a('string');
            expect(result).to.equal(String.fromCharCode(i));
        }
    });
    it('returns 3 characters from C', () => {
        const iterator = Nanami.charGenerator(3, 'C')();
        for (let i = 'C'.charCodeAt(), result; i < 3; i++) {
            result = iterator.next().value;
            expect(result).to.be.a('string');
            expect(result).to.equal(String.fromCharCode(i));
        }
    });
});
describe('Basic Nanami test', () => {
    it('with basic substitution', () => {
        const nanami = new Nanami("{string} is a number", Nanami.integerGenerator(3));
        let i = 0;
        for (let result of nanami) {
            switch (i) {
                case 0:
                    expect(result).to.equal('0 is a number');
                    break;
                case 1:
                    expect(result).to.equal('1 is a number');
                    break;
                case 2:
                    expect(result).to.equal('2 is a number');
                    break;
                default:
                    expect(i).to.be.below(3);
            }
            expect(result).to.not.have.string('string');
            i++;
        }
    });
    it('next function', () => {
        const nanami = new Nanami("{string} is a number", Nanami.integerGenerator(3));
        expect(nanami.next()).to.equal(`0 is a number`);
        expect(nanami.next()).to.equal(`1 is a number`);
        expect(nanami.next()).to.equal(`2 is a number`);
        expect(nanami.next()).to.be.undefined;
    });
    it('with double loop', () => {
        const nanami = new Nanami("{foo} is a number and {bar} is a char", Nanami.integerGenerator(3), Nanami.charGenerator(3));
        let i = 0;
        for (let result of nanami) {
            switch (i) {
                case 0:
                    expect(result).to.equal('0 is a number and a is a char');
                    break;
                case 1:
                    expect(result).to.equal('0 is a number and b is a char');
                    break;
                case 2:
                    expect(result).to.equal('0 is a number and c is a char');
                    break;
                case 3:
                    expect(result).to.equal('1 is a number and a is a char');
                    break;
                case 4:
                    expect(result).to.equal('1 is a number and b is a char');
                    break;
                case 5:
                    expect(result).to.equal('1 is a number and c is a char');
                    break;
                case 6:
                    expect(result).to.equal('2 is a number and a is a char');
                    break;
                case 7:
                    expect(result).to.equal('2 is a number and b is a char');
                    break;
                case 8:
                    expect(result).to.equal('2 is a number and c is a char');
                    break;
                default:
                    expect(i).to.be.below(9);
            }
            expect(result).to.not.have.string('foo');
            expect(result).to.not.have.string('bar');
            i++;
        }
    });
});

describe('Advanced Nanami test', () => {
    it('inspect iteration', () => {
        const nanami = new Nanami("{foo} is a number and {bar} is a char", Nanami.integerGenerator(3), Nanami.charGenerator(3));
        let i = 0;
        nanami.activateParamInstance();
        for (let iteration of nanami) {
            nanami.applyParamInstances((result, foo, bar) => {
                switch (i) {
                    case 0:
                        expect(result).to.equal('0 is a number and a is a char');
                        expect(foo).to.equal(0);
                        expect(bar).to.equal('a');
                        break;
                    case 1:
                        expect(result).to.equal('0 is a number and b is a char');
                        expect(foo).to.equal(0);
                        expect(bar).to.equal('b');
                        break;
                    case 2:
                        expect(result).to.equal('0 is a number and c is a char');
                        expect(foo).to.equal(0);
                        expect(bar).to.equal('c');
                        break;
                    case 3:
                        expect(result).to.equal('1 is a number and a is a char');
                        expect(foo).to.equal(1);
                        expect(bar).to.equal('a');
                        break;
                    case 4:
                        expect(result).to.equal('1 is a number and b is a char');
                        expect(foo).to.equal(1);
                        expect(bar).to.equal('b');
                        break;
                    case 5:
                        expect(result).to.equal('1 is a number and c is a char');
                        expect(foo).to.equal(1);
                        expect(bar).to.equal('c');
                        break;
                    case 6:
                        expect(result).to.equal('2 is a number and a is a char');
                        expect(foo).to.equal(2);
                        expect(bar).to.equal('a');
                        break;
                    case 7:
                        expect(result).to.equal('2 is a number and b is a char');
                        expect(foo).to.equal(2);
                        expect(bar).to.equal('b');
                        break;
                    case 8:
                        expect(result).to.equal('2 is a number and c is a char');
                        expect(foo).to.equal(2);
                        expect(bar).to.equal('c');
                        break;
                    default:
                        expect(i).to.be.below(9);
                }
                expect(result).to.not.have.string('foo');
                expect(result).to.not.have.string('bar');
            })
            expect(iteration).to.not.have.string('foo');
            expect(iteration).to.not.have.string('bar');
            i++;
        }
        nanami.deactivateParamInstance();
    });
    it('with each', () => {
        const nanami = new Nanami("{foo} is a number and {bar} is a char", Nanami.integerGenerator(3), Nanami.charGenerator(3));
        let i = 0;
        nanami.each((result, foo, bar) => {
            switch (i) {
                case 0:
                    expect(result).to.equal('0 is a number and a is a char');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('a');
                    break;
                case 1:
                    expect(result).to.equal('0 is a number and b is a char');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('b');
                    break;
                case 2:
                    expect(result).to.equal('0 is a number and c is a char');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('c');
                    break;
                case 3:
                    expect(result).to.equal('1 is a number and a is a char');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('a');
                    break;
                case 4:
                    expect(result).to.equal('1 is a number and b is a char');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('b');
                    break;
                case 5:
                    expect(result).to.equal('1 is a number and c is a char');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('c');
                    break;
                case 6:
                    expect(result).to.equal('2 is a number and a is a char');
                    expect(foo).to.equal(2);
                    expect(bar).to.equal('a');
                    break;
                case 7:
                    expect(result).to.equal('2 is a number and b is a char');
                    expect(foo).to.equal(2);
                    expect(bar).to.equal('b');
                    break;
                case 8:
                    expect(result).to.equal('2 is a number and c is a char');
                    expect(foo).to.equal(2);
                    expect(bar).to.equal('c');
                    break;
                default:
                    expect(i).to.be.below(9);
            }
            expect(result).to.not.have.string('foo');
            expect(result).to.not.have.string('bar');
            i++;
        });
    });
    it('with map', () => {
        const nanami = new Nanami("{foo}{bar}", Nanami.integerGenerator(2), Nanami.charGenerator(2));
        let i = 0;
        const resultArray = nanami.map((result, foo, bar) => {
            switch (i) {
                case 0:
                    expect(result).to.equal('0a');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('a');
                    break;
                case 1:
                    expect(result).to.equal('0b');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('b');
                    break;
                case 2:
                    expect(result).to.equal('1a');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('a');
                    break;
                case 3:
                    expect(result).to.equal('1b');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('b');
                    break;
            }
            expect(result).to.not.have.string('foo');
            expect(result).to.not.have.string('bar');
            i++;
            return result;
        });
        expect(resultArray).to.eql(["0a", "0b", "1a", "1b"]);
    });
    it('getIterator', () => {
        const nanami = new Nanami("{foo} is a number and {bar} is a char", Nanami.integerGenerator(3), Nanami.charGenerator(3)),
            iterator = nanami.getIterator(),
            firstResult = iterator.next();
        expect(firstResult.done).to.be.false;
        expect(firstResult.value).to.equal('0 is a number and a is a char');
        expect(iterator.next().value).to.equal('0 is a number and b is a char');
        expect(iterator.next().value).to.equal('0 is a number and c is a char');
        expect(iterator.next().value).to.equal('1 is a number and a is a char');
        expect(iterator.next().value).to.equal('1 is a number and b is a char');
        expect(iterator.next().value).to.equal('1 is a number and c is a char');
        expect(iterator.next().value).to.equal('2 is a number and a is a char');
        expect(iterator.next().value).to.equal('2 is a number and b is a char');
        expect(iterator.next().value).to.equal('2 is a number and c is a char');
        const lastResult = iterator.next();
        expect(lastResult.done).to.be.true;
        expect(lastResult.value).to.equal(void 0);
    });

    const nanami = new Nanami("{foo} is a number and {bar} is a char", Nanami.integerGenerator(3), Nanami.charGenerator(3));
    let sequencePromise;
    it('eachSequentialProcess', () => {
        let i = 0;
        sequencePromise = Nanami.eachSequentialProcess(nanami, (result, foo, bar) => {
            switch (i) {
                case 0:
                    expect(result).to.equal('0 is a number and a is a char');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('a');
                    break;
                case 1:
                    expect(result).to.equal('0 is a number and b is a char');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('b');
                    break;
                case 2:
                    expect(result).to.equal('0 is a number and c is a char');
                    expect(foo).to.equal(0);
                    expect(bar).to.equal('c');
                    break;
                case 3:
                    expect(result).to.equal('1 is a number and a is a char');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('a');
                    break;
                case 4:
                    expect(result).to.equal('1 is a number and b is a char');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('b');
                    break;
                case 5:
                    expect(result).to.equal('1 is a number and c is a char');
                    expect(foo).to.equal(1);
                    expect(bar).to.equal('c');
                    break;
                case 6:
                    expect(result).to.equal('2 is a number and a is a char');
                    expect(foo).to.equal(2);
                    expect(bar).to.equal('a');
                    break;
                case 7:
                    expect(result).to.equal('2 is a number and b is a char');
                    expect(foo).to.equal(2);
                    expect(bar).to.equal('b');
                    break;
                case 8:
                    expect(result).to.equal('2 is a number and c is a char');
                    expect(foo).to.equal(2);
                    expect(bar).to.equal('c');
                    break;
                default:
                    expect(i).to.be.below(9);
            }
            return new Promise((resolve, reject) => {
                let time = Math.ceil(Math.random() * 1000),
                    success = Math.random() < 0.5;
                // console.log(success, time);
                setTimeout(() => {
                    success ? resolve(i) : reject(i);
                    i++;
                }, time);
            });
        });
    });
    it('eachSequentialProcess sequence', function(done) {
        this.timeout(0);
        sequencePromise.then(result => {
            expect(result).to.have.lengthOf(9);
            let j = 0;
            for (let subResult of result) {
                expect(subResult.result).to.equal(j);
                expect(subResult.success).to.be.oneOf([true, false]);
                j++;
            }
        }).catch(error => {
            console.log("Error:", error);
        }).then(done);
    });
    it('eachBatchProcess', function(done) {
        let i = 0;
        this.timeout(0);
        Nanami.eachBatchProcess(nanami, (result, foo, bar) => {
            return new Promise((resolve, reject) => {
                let time = Math.ceil(Math.random() * 1000),
                    success = Math.random() < 0.5;
                // console.log(success, time);
                setTimeout(() => {
                    success ? resolve(i) : reject(i);
                    i++;
                }, time);
            });
        }).then(result => {
            // console.log(result);
            for (let subResult of result) {
                expect(subResult.result).to.be.below(9);
                expect(subResult.success).to.be.oneOf([true, false]);
            }
        }).then(done);
    });
});
