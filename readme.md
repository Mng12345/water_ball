# example
![example](https://github.com/Mng12345/water_ball/blob/main/examples/mnggiflab-compressed-from-screen-recorder-2023_12_0610_25_51.gif)
# example, see the code in directory `examples`

```js
// @ts-check

const waterball = require('waterball');

main()

function main() {
  const container = document.getElementById('container')
  if (container === null) {
    throw new Error(`container is null`)
  }
  /**
   * @type {waterball.default.Data[]}
   */
  const points = [
    {
      value: 20,
      label: 'xx1'
    },
    {
      value: 30,
      label: 'xx2'
    },
    {
      value: 40,
      label: 'xx3'
    },
    {
      value: 50,
      label: 'xx4'
    },
    {
      value: 60,
      label: 'xx5'
    },
    {
      value: 40,
      label: 'xx6'
    },
  ]
  console.log(`start init`)
  waterball.default.init(container, points)
}



```