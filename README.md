# ECharts-Theme-Builder

Design your own theme for Apache ECharts.

[https://imzbf.github.io/echarts-theme-builder/zh/index.html](https://imzbf.github.io/echarts-theme-builder/zh/index.html)

![](https://raw.githubusercontent.com/Ovilia/ECharts-Theme-Builder/master/assets/essos.png)

## Build

```bash
npm install
npm run build
```

## Release to echarts-www

Update the echarts-www and echarts-website project path in `config/env.asf.js` before run

```bash
npm run release
```

It will generate the html to the `_generated` folder of echarts-www. And other resources to the echarts-website folder
