# Nanami

An iterator for dynamic substituion on string pattern

  - No more unreadable RegExp
  - Easy hook with static Integer/Char generator
  - Loop of loop of loop....

### Example

Single Iteration:
```js
var Nanami = require("nanami");
for (let result of new Nanami("This is loop {x}", Nanami.integerGenerator(5))) {
    console.log(result);
}
/** Results:
This is loop 0
This is loop 1
This is loop 2
This is loop 3
This is loop 4
**/
```

Double Iteration:
```js
var Nanami = require("nanami");
for (let result of new Nanami("This is {a} double loop {x}", Nanami.charGenerator(2), Nanami.integerGenerator(3, 1))) {
    console.log(result);
}
/** Results:
This is a double loop 1
This is a double loop 2
This is a double loop 3
This is b double loop 1
This is b double loop 2
This is b double loop 3
**/
```

Iteration inspection:
```js
var Nanami = require("nanami");
let nanamin = new Nanami(
        "file://{a}{x}.dat", 
        Nanami.charGenerator(2, 'm'), 
        Nanami.integerGenerator(3, 1)
    );
nanamin.each((result, a, x) => {
    console.log(`${result} \ta=${a}\tx=${x}`);
});
/** Results:
file://m1.dat 	a=m	x=1
file://m2.dat 	a=m	x=2
file://m3.dat 	a=m	x=3
file://n1.dat 	a=n	x=1
file://n2.dat 	a=n	x=2
file://n3.dat 	a=n	x=3
**/
```
