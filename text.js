const data = [
  {
    x: "2010",
    y: 0,
  },
  {
    x: "2011",
    y: 42,
  },
  {
    x: "2012",
    y: 13,
  },
  {
    x: "2013",
    y: 17,
  },
  {
    x: "2015",
    y: 127,
  },
  {
    x: "2016",
    y: 0,
  },
];

/* 6-й щаг, создаем класс для создания основного и вспомогательных SVG объектов */
class Chart {
  createSvgElement(tagName) {
    /* создаем такой элемент который передан в эту функцию */
    return document.createElementNS("http://www.w3.org/2000/svg", tagName);
  }

  /* 11-й шаг, получает сам SVG объект, а также SVG атрибуты */
  setAttributes($svgElement, attributesObject) {
    /* 12-й шаг,  и проставляем атрибуты их SVG объекту */
    Object.keys(attributesObject).forEach((key) => {
      $svgElement.setAttribute(key, attributesObject[key]);
    });
  }
}

/* 1-й шаг создаем класс LineChart */
/* 8-й шаг дописываем наследование extends Chart */
class LineChart extends Chart {
  /* переменные отступа от краев не будут меняться */
  horizontalPadding = 30; /* отступ по бокам */
  legendYPadding = 50; /* отступ снизу */
  topYPadding = 30; /* отступ сверху  */
  chartLineStrokeWidth = 5; /* толщина линии - работает как дополнительный отступ */
  circleRadius = 6; /* радиус точки на графике */

  /* $container - DOM элемент */
  constructor(data, $container) {
    /* 9-й шаг дописываем super(); тем самым вызывая конструктор родительского класса */
    super();

    /* присваиваем все данные этому классу  */
    this.data = data;
    this.$container = $container;
    /* максимальная высота и ширина этого класса  */
    this.maxWidth = this.$container.offsetWidth; /* ширина контейнера */
    this.maxHeight = this.$container.offsetHeight; /* высота контейнера */

    /* 26-й шаг, максимальная ширина графика  */
    this.maxChartWidth =
      this.maxWidth -
      this.horizontalPadding *
        3; /* 2 - так как отступ слева и справа по 30px */
    this.maxChartHeight =
      this.maxHeight - this.legendYPadding - this.topYPadding;

    /* 24-й шаг, получаем переменную указывающая насколько мы будем увеличивать наш график. 
    Для этого нужно максимальную высоту поделить на разницу межу максимальным и минимальным значением из набора */
    this.maxY = Math.max(...data.map((el) => el.y));
    this.minY = Math.min(...data.map((el) => el.y));
    this.zoom = this.maxChartHeight / (this.maxY - this.minY);

    /* если zoom равен бесконечности, это когда все значения одинаковые и их разница равна нулю */
    if (!isFinite(this.zoom)) {
      this.zoom = 1;
    }
  }

  /* 15-й шаб, рисуем линию  */
  createChartLine() {
    /* 16-й, шаг создаем SVG элемент "path" */
    const $chartLine = this.createSvgElement("path");

    /* 17-й шаг задаем SVG элементу базовые атрибуты */
    this.setAttributes($chartLine, {
      stroke: "#FF5D5B" /* цвет - красный */,
      "stroke-width":
        this.chartLineStrokeWidth /* ширина линии 5-ть пикселей */,
      fill: "none" /* линия ни как не заполняется */,
      "stroke-linecap": "round" /* округление концов линии */,
      "stroke-linejoin": "round" /* округление углов линии */,
    });

    /* 18-й шаг, возвращаем линию из метода */
    return $chartLine;
  }

  /* 28-й шаг, создаем метод легенды */
  createAxisXSeparator() {
    const $axisXLine = this.createSvgElement("line");
    this.setAttributes($axisXLine, {
      x1: 0,
      x2: this.maxWidth,
      y1:
        this.maxChartHeight +
        this
          .topYPadding /* опускаем линию легенды ниже отступа от нижнего края */ +
        this
          .chartLineStrokeWidth /* отступ по вертикали на толщину линии графика */,
      y2:
        this.maxChartHeight +
        this.topYPadding /* опускаем линию легенды ниже отступа */ +
        this.chartLineStrokeWidth /* прибавляем к Y координате толщину линии */,
      stroke: "black" /* задаем цвет легенды */,
      "stroke-width": 1 /* ширина легенды */,
    });
    return $axisXLine;
  }

  /* 32-й шаг, описываем легенду по Y координатам (создаем горизонтальные линий по вертикали) */
  createTicks() {
    /* определяем высоту для каждой горизонтальной линии? */
    const heightPerTick = 74;
    /* сколько их у нас будет */
    /* Для этого нужно разделить всю высоту нашего графика */
    /* на количество пикселей для одной горизонтальной линии    */
    const ticksCount = this.maxChartHeight / heightPerTick;
    /* разница между настоящими значениями Y для каждой точки */
    /* чтобы получить шаг для графика нужно получить разницу между максимальной */
    /* точкой Y и минимальной точкой Y и поделить на количество точек */
    const tickAdd = (this.maxY - this.minY) / ticksCount;
    /* создаем массив чтобы отрисовать горизонтальную линию, которые будут лежать в массиве DOM элементов */
    const $ticks = []; /* массив DOM элементов */
    let tickValue =
      this.maxY; /* максимальное значение координат по вертикали */

    /* создаем горизонтальной линии  */
    for (let i = 0; i < ticksCount; i++) {
      /* рассчитываем координату по вертикали = (константа по высоте) * (шаг) + (отступ сверху) - (радиус кружочка на графике)*/
      const currentY = heightPerTick * i + this.topYPadding - this.circleRadius;
      /* создаем элемент отметку как line */
      const $tick = this.createSvgElement("line");
      /* проставляем атрибуты объекта */
      this.setAttributes($tick, {
        x1: this
          .horizontalPadding /* смотри 26-й шаг, максимальная ширина графика  */,

        x2:
          this.maxChartWidth /* максимальная ширина графика*/ +
          this
            .horizontalPadding /* к которой мы прибавляем горизонтальный отступ */,
        y1: currentY /* координата по вертикали */,
        y2: currentY /* координата по вертикали */,
        "stroke-width": 0.5 /* ширина линии */,
        stroke: "#ccc" /* цвет линии равен серому */,
      });

      /* 43-й шаг, проставляем значение координату по вертикали на горизонтальной линии */
      const $text = this.createSvgElement("text");

      /* 44-й шаг, устанавливаем атрибуты текста */
      this.setAttributes($text, {
        x: this.maxWidth - this.horizontalPadding,
        y: currentY,
      });

      /* 45-й шаг, устанавливаем значение округленное до оного знака после запятой  */
      $text.append(tickValue.toFixed(0));

      /* передаем эти линии - $tick в массив строк - $ticks */
      $ticks.push($tick, $text);
      tickValue -= tickAdd;
    }
    /* возвращаем из функции набор вертикальных линий */
    return $ticks;
  }

  /* 35-й шаг, создаем метод -> круглые точки на графике */
  createCircle(el, x, y) {
    const $circle = this.createSvgElement("circle");
    this.setAttributes($circle, {
      r: this.circleRadius /* радиус точки на графике */,
      cx: x /* координата центра круга которая будет равна X входящему */,
      cy: y /* координата центра круга которая будет равна Y входящему */,
      fill: "#FF5D5B" /* заливка круга делаем красным цветом '#FF5D5B' */,
      stroke:
        "rgba(255, 160, 170, .5)" /* 41-й шаг, устанавливаем цвет заливки, границы фигуры SVG.*/,
    });
    /* добавляем точке текст, который будет выводиться при наведение на точку - tool type */
    $circle.dataset.text = `x: ${el.x}, у: ${el.y}`;

    /* 39-й шаг, добавляем класс у круга, чтобы изменять его размер при наведении */
    $circle.classList.add("circle");

    /* добавляем атрибут, который мы проверим (что он есть в 36-м шаге), при наведение на круг мышкой */
    $circle.dataset.circle = "true";

    /* возвращаем круг */
    return $circle;
  }

  /* 37-й шаг, создание подсказки tooltip */
  onCircleOver($circle) {
    /* создаем нашу подсказку в виде "div" элемента */
    const $tooltip = document.createElement("div");

    /* нашу подсказку нужно передать сам текст */
    $tooltip.textContent = $circle.dataset.text;

    /* 40-й шаг, добавляем класс у круга, для установки ширины границы для фигуры SVG.*/
    $circle.setAttribute("stroke-width", 15);

    /* добавляем класс для отображения CSS обводки для tooltip */
    $tooltip.classList.add("tooltip");

    /* воспользуемся библиотекой popper которую мы подключили */
    /* передаем в эту библиотеку объект круг и тот элемент, который будет выступать в виде подсказки */
    const popperElement = Popper.createPopper($circle, $tooltip);

    /* добавляем на нашу функцию слушатель событий, он один и он добавляется при определенном условии и мы его сразу снимаем  */
    $circle.onmouseout = () => {
      /* если мы увели курсор мышки с круга на графике то подсказка удаляется */
      $tooltip.remove();

      /* 42-й шаг, возвращаем размер круга на графике в исходное значение */
      $circle.setAttribute("stroke-width", 0);

      /* и наш круг больше ничего слушать не будет у него нет никаких событий */
      $circle.onmouseout = null;
    };

    /* включаем Popper элемент, делаем чтобы он появился, поэтому добавляем его SVG контейнеру */
    this.$container.appendChild($tooltip);
  }

  /* 2-й гаг создаем класс create() метод */
  create() {
    /* 5-й шаг создаем Холст - SVG документ через метод: 
    createSvgElementNS("http://www.w3.org/2000/svg", "svg") для svg объектов 
    стандартные html5 элементы создаются через document.createSvgElement()
    а SVG элементы создаются через document.createElementNS ("http://www.w3.org/2000/svg", "тип элемента") */

    /* 7-й шаг, создаем svg элемент через наш собственный класс  */
    const $svg = this.createSvgElement("svg");

    /* 10-й шаг, прописываем атрибуты для $svg */
    this.setAttributes($svg, {
      width: "100%",
      height: "100%",
      viewBox: `0 0 ${this.maxWidth} ${this.maxHeight}`,
    });

    /* 14-й шаб, рисуем линию  */
    const $chartLine = this.createChartLine();

    /* 32-й шаг, создаем легенду по Y координатам (рисуем массив вертикальных черточек ) */
    const $ticks = this.createTicks();

    /* 27-й шаг, рисуем легенду графика */
    const $legendXLine = this.createAxisXSeparator();

    /* 19-й шаг, рассчитываем шаг между точками, 
    ширину всей линии делим на количество элементов входящего массива -1 
    это и есть ширина всего графика */
    const lineLength = this.maxChartWidth / (this.data.length - 1);

    /*  25-й шаг, получаем сдвиг от минимального значения графика this.minY * this.zoom */
    const yShift = this.minY * this.zoom;

    /* 38-й шаг, SVG объекты ниже должны создаться раньше чем кружочки на линии -> createCircle(el, x, y); */
    /* 33-й шаг, создаем легенду по Y координатам (рисуем массив вертикальных линий  ) ...$ticks */
    /* 23-й шаг, добавляем линию графика в SVG контейнер $chartLine */
    /* 29-й шаг, добавляем линию легенды в SVG контейнер $legendXLine */
    $svg.append(...$ticks, $chartLine, $legendXLine);

    /* 20-й шаг, создадим путь линии начиная с точки M - move to */
    let d = "M ";
    let currentX = 0;
    this.data.forEach((el, i) => {
      /* 21-й шаг, вычисляем точки графика */
      const x =
        currentX + this.horizontalPadding; /* добавляем горизонтальный отступ */
      /* (максимальная высота) минус (значение из набора) умножаем на (масштаб) и прибавляем (сдвиг) вычитаем (радиус круга) */
      const y =
        this.maxChartHeight -
        el.y * this.zoom +
        yShift +
        this.topYPadding -
        this.circleRadius;

      /* 34-й шаг, создаем круглые точки на графике createCircle */
      const $circle = this.createCircle(el, x, y);

      /*  добавляем к строке новую координату */
      d += `${x} ${y} `;
      if (i == 1) {
        d += `L`;
      }

      /* 29-й шаг, создаем цифры линию подсказки */
      const $legendXText = this.createSvgElement("text");
      this.setAttributes($legendXText, {
        x: x,
        y: this.maxHeight - 15,
      });
      /* 30-й шаг, добавляем текст в SVG элемент */
      /* $legendXText.append(el.x); */
      $legendXText.textContent = el.x;

      /* 31-й шаг, добавляем готовую легенду в SVG контейнер $legendXText */
      /* 35-й шаг, добавляем круглые точки на графике в SVG контейнер $circle */
      $svg.append($circle, $legendXText);

      /* 22-й шаг, текущее значение X увеличиваем на длину линии  */
      currentX += lineLength;
    });

    /* 22-й шаг, добавляем в SVG объект атрибут "d" где должны лежать координаты линии */
    $chartLine.setAttribute("d", d);

    /* 13-й шаг, добавляем SVG элемент в SVG контейнер, это получился один элемент */
    this.$container.appendChild($svg);

    /* 36-й шаг, создаем всплывающую подсказку tool type при наведение мышки на точку на графике.  */
    /* при наведение мыши на DOM элемент мы получаем событие в котором мы проверяем, что наш элемент что то содержит */
    $svg.onmouseover = (e) => {
      /* здесь мы проверяем, что наш элемент что то содержит и является кругом, этот атрибут мы сами добавили в методе createCircle() */
      if (e.target.dataset.circle) {
        this.onCircleOver(e.target);
      }
    };

    /* возвращаем график */
    return this;
  }
}

/* 4-й шаг передаем контейнер <div id="chart"></div> */
const $chartContainer = document.getElementById("chart");

/* 3-й шаг обращаемся к классу в него передаем данные в класс для регистрации базовых данных */
new LineChart(
  data,
  $chartContainer
).create(); /* начало работы программы начинается с create() */
