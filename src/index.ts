import * as waterwaves from './waterwaves'
import * as d3 from 'd3'

namespace uid {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')

  export function uid(len: number = 32): string {
    type CharSet = { [index: string]: 0 | undefined }
    const getRandomChar = (charSet: CharSet): string => {
      while (true) {
        const ci = Math.floor(Math.random() * chars.length)
        const c = chars[ci]
        if (charSet[c] === undefined) {
          charSet[c] = 0
          return c
        }
      }
    }
    const charSet: CharSet = {}
    const result: string[] = []
    for (let i = 0; i < len; i++) {
      result.push(getRandomChar(charSet))
    }
    return result.join('')
  }
}

namespace waterball {
  export interface Controller {
    destroy(): void
  }

  export type Options = {
    frontWaveColor?: string
    bgWaveColor?: string
    waveHeightRatio?: number // the wave height / ball height, the bound is [0, 1].
    waveSpeed?: number // the wave speed, the bound is [1, 30]
    containerWidth: number
    containerHeight: number
    borderColor?: string
    radiusBound?: [min: number, max: number] // the radius bound the final renderer ball.
    xForce?: 'center' | ((nodeIndex: number) => number) // decide how balls distribute in x axios
    yForce?: 'center' | ((nodeIndex: number) => number) // decide how balls distribute in y axios
  }

  export type Data = {
    value: number
    label: string
  }

  interface Circle {
    getLabel(): string
    getValue(): number
    getRadius(): number
    formatValue(): string
  }

  export function init(container: Element, points: Data[]): Controller
  export function init(
    container: Element,
    points: Data[],
    options: Options,
    valueFormat?: (value: number) => string,
    labelFormat?: (label: string) => string
  ): Controller
  export function init(
    container: Element,
    points: Data[],
    options?: Options,
    valueFormat = defaultValueFormat,
    labelFormat = defaultLabelFormat
  ): Controller {
    const containerSize = getElementSize(container)
    const options_ = {
      frontWaveColor: '#3ACD8E',
      bgWaveColor: '#53ABD9',
      waveHeightRatio: 0.5,
      waveSpeed: 10,
      borderColor: '#CFE0E5',
      radiusBound: [computeMinValue(), computeMaxValue()] as const,
      xForce: 'center' as const,
      yForce: 'center' as const,
      ...(options ?? {
        containerWidth: containerSize.w,
        containerHeight: containerSize.h,
      }),
    }
    const createCircle = createCircleFac(
      [computeMinValue(), computeMaxValue()],
      options_.radiusBound
    )
    const circles = points.map(createCircle)
    const simulation = d3
      .forceSimulation()
      .force('x', createForceXY('x', options_.xForce, containerSize))
      .force('y', createForceXY('y', options_.yForce, containerSize))
      .force('charge', d3.forceManyBody().strength(0.1))
      .force(
        'collide',
        d3
          .forceCollide()
          .strength(0.2)
          .radius((_node, i) => circles[i].getRadius())
          .iterations(1)
      )
    simulation
      .nodes(circles.map((item, index) => ({ index })))
      .on('tick', onSimulation.bind(simulation, false))
      .on('end', () => {
        onSimulation.bind(simulation, true)()()
      })
    let destroyWaves: undefined | (() => void) = undefined

    return {
      destroy,
    }

    function onSimulation(this: typeof simulation, isSimulationEnded: boolean) {
      const result: { x: number; y: number; circleData: Circle }[] = []
      this.nodes().forEach((item, index) => {
        if (item.x !== undefined && item.y !== undefined) {
          result.push({
            x: item.x,
            y: item.y,
            circleData: circles[index],
          })
        }
      })
      return drawCircles(result, container)

      function drawCircles(
        circles: { x: number; y: number; circleData: Circle }[],
        container: Element
      ) {
        container.innerHTML = ''
        if (destroyWaves !== undefined) {
          destroyWaves()
        }
        const circleEles = circles
          .map(drawCircle)
          .reduce((result: NonNullable<typeof item>[], item) => {
            if (item !== undefined) {
              result.push(item)
            }
            return result
          }, [])
        container.append(...circleEles.map((item) => item.ele))
        return () => {
          if (destroyWaves !== undefined) {
            destroyWaves()
          }
          const polos = circleEles.map((item) => item.drawWave())
          destroyWaves = () => polos.forEach((item) => item?.destroy())
        }

        function drawCircle(circle: (typeof circles)[0]):
          | {
              ele: HTMLDivElement
              drawWave: () => undefined | waterwaves.WaterPolo
            }
          | undefined {
          const div = document.createElement('div')
          div.style.width = `${circle.circleData.getRadius() * 2}px`
          div.style.height = `${circle.circleData.getRadius() * 2}px`
          div.style.position = `absolute`
          div.style.left = `${circle.x - circle.circleData.getRadius()}px`
          div.style.top = `${circle.y - circle.circleData.getRadius()}px`
          div.style.borderRadius = `50%`
          div.style.border = isSimulationEnded ? 'none' : `solid 2px #CFE0E5`
          const canvasId = `_${uid.uid()}`
          div.innerHTML = `<div style="position: relative; width: 100%; height: 100%">
            <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 1">
              <canvas id="${canvasId}" />
            </div>
            <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 1">
              <div style="text-align: center; margin-top: 10px">
                <div style="font-size: 20px; color: #FFFFFF;">${circle.circleData.formatValue()}</div>
                <div style="font-size: 12px; color: #FFFFFF;">${circle.circleData.getLabel()}</div>
              </div>
            </div>
          </div>`
          const canvas = div.querySelector(`#${canvasId}`)
          if (!(canvas instanceof HTMLCanvasElement)) {
            return undefined
          }
          canvas.width = circle.circleData.getRadius() * 2
          canvas.height = circle.circleData.getRadius() * 2
          canvas.style.width = `${circle.circleData.getRadius() * 2}`
          canvas.style.height = `${circle.circleData.getRadius() * 2}`
          return {
            ele: div,
            drawWave: () => drawWave(canvas),
          }

          function drawWave(canvas: HTMLCanvasElement) {
            return waterwaves.newWaterPolo(canvas, {
              cW: circle.circleData.getRadius() * 2,
              cH: circle.circleData.getRadius() * 2,
              baseY: circle.circleData.getRadius(),
              nowRange: 0,
              oneColor: '#3ACD8E',
              twoColor: '#53ABD9',
              lineColor: '#CFE0E5',
            })
          }
        }
      }
    }

    function destroy(): void {
      if (destroyWaves !== undefined) {
        destroyWaves()
        destroyWaves = undefined
      }
    }

    function getElementSize(element: Element): { w: number; h: number } {
      const rect = element.getBoundingClientRect()
      return {
        w: rect.width,
        h: rect.height,
      }
    }

    function createCircleFac(
      dataBound: readonly [min: number, max: number],
      radiusBound: readonly [min: number, max: number]
    ): (data: Data) => Circle {
      return createCircle
      function createCircle(data: Data) {
        return {
          getLabel: () => labelFormat(data.label),
          getValue: () => data.value,
          getRadius: () => boundValue(data.value),
          formatValue: () => valueFormat(data.value),
        }

        function boundValue(value: number): number {
          if (radiusBound[0] === radiusBound[1]) {
            return radiusBound[0]
          }
          return (
            ((value - dataBound[0]) / (dataBound[1] - dataBound[0])) *
              (radiusBound[1] - radiusBound[0]) +
            radiusBound[0]
          )
        }
      }
    }

    function computeMinValue(): number {
      return points.reduce((min, item) => {
        return Math.min(min, item.value)
      }, Number.MAX_VALUE)
    }

    function computeMaxValue(): number {
      return points.reduce((max, item) => {
        return Math.max(max, item.value)
      }, Number.MIN_VALUE)
    }

    function createForceXY(
      type: 'x' | 'y',
      force: NonNullable<Options['xForce'] | Options['yForce']>,
      containerSize: { w: number; h: number }
    ): ReturnType<typeof d3.forceX | typeof d3.forceY> {
      let forceF: typeof d3.forceX | typeof d3.forceY
      let centerValue: number
      switch (type) {
        case 'x': {
          forceF = d3.forceX
          centerValue = containerSize.w / 2
          break
        }
        case 'y': {
          forceF = d3.forceY
          centerValue = containerSize.h / 2
          break
        }
      }
      if (force === 'center') {
        return forceF(centerValue)
      }
      return forceF((_node, index) => force(index))
    }
  }

  /**
   * The value formatter function.
   * @param value
   * @returns return the formatted value or html string, like <span>value</span>
   */
  function defaultValueFormat(value: number): string {
    return `${value}`
  }

  /**
   * the label formatter function.
   * @param label
   * @returns return the formatted label or html string, like <span>label</span>
   */
  function defaultLabelFormat(label: string): string {
    return label
  }
}

export default waterball
