# 神奇后端在哪里

在折腾了两天的前端开发之后，我想您已经基本走通搭建出一个自己还算喜欢的网页的流程了。但您一定也发现了单有前端的缺陷：它只能将状态存储在运行的浏览器为网页分配的存储空间中，无法跨越网页传递，更无法与其他人共享。

## 后端是什么

对于一些无需交互的项目，例如个人主页、离线应用来说，只提供一个前端就足够了。但对于一些应用来说，提供方便快捷的数据同步服务也会为用户的使用带来不少便利；对于例如 SNS 或是 IM 这种用于人际交互的平台来说，提供将大家都连接起来的中心则更是实现交互的必备需求之一。后端，就是为了解决这个需求而出现的。

或者，如果说您了解过 [C/S 架构] 的话，您一定不会对这个概念感到陌生——把前端网页当作是一种 client 的话，后端就是对应的 server 了。

[C/S 架构]: https://zh.wikipedia.org/zh-cn/%E5%AE%A2%E6%88%B7%E7%AB%AF-%E6%9C%8D%E5%8A%A1%E5%99%A8%E6%9E%B6%E6%9E%84

但其实所谓的「后端」也往往只是为了和「前端」搭配使用而造出来的词汇。它们之间彼此独立未必要成对出现，一群后端也完全可以组建出一个彼此之间信息流通的交互网络（ P2P 结构）。这个课题里因为只是面向全栈速成，所以不会太多地去涉及 P2P 相关的内容；但如果您有兴趣的话，完全可以在有空的时候稍微了解一下相关的信息：一个更亲切的例子则是我们喜欢的 Fediverse ，它兼具了 P2P 结构和 前/后端 结构的特性，如果您有兴趣的话，也完全可以了解一下其中精妙的实现细节。

## 用什么语言编写后端

由于其运行环境只和服务器的环境配置有关，不与用户浏览器相绑定，所以我们可以使用任何喜欢的语言来编写。例如非常经典的 PHP ，或是我们刚刚稍微有所了解的 JavaScript ，或是方便组合连接使用的 Python ，或是传统的高性能项目必备的 C++ ，或是内存安全的 Rust 等等。而我们这个课题，则会选择使用 Go 语言来编写：它是一种较为高性能的语言，自带一套较为完善的包管理系统，编译时的报错比较容易理解，并且自带一套测试工具，在我看来可以作为一种入门尝试的语言。

当然，如果您有其他语言的偏好，也完全可以使用。语言只是一种用于实现我们想法的工具，它本身并不重要，重要的是怎样能更快更好地将我们的想法落地，在耐心耗尽之前找到下一个能激励我们继续航行的灯塔。

::: tip 如果您在寻求不同的语言...

您可以参考 [StackOverflow 的 2023 年度调查]，了解一下最新的开发者趋势。

[StackOverflow 的 2023 年度调查]: https://survey.stackoverflow.co/2023/

:::

## 创建一个项目

由于我们不使用任何的模板，所以需要手动创建一个项目目录，就像我们在 Day 2 中做的那样——创建一个目录，然后用我们的开发工具打开它。这里以 GoLand 为例。

Go 项目本身不需要什么配置就可以直接开始开发，但为了方便在之后引入一些外部的包，我们需要针对项目初始化一下 Go 自带的包管理系统。

```sh
go mod init hello-server
```

其中， `hello-server` 是我们的项目的总包名。对于一个独立运行的项目来说，它并不重要，出于美观的考虑我通常会使用项目本身的名称；但对于一些编写用于作为 SDK 或是依赖提供的项目来说，通常会使用在线的代码仓库（或其他托管服务）的完整路径，例如 `github.com/{owner}/{repo}` 这样的形式，以方便其他的开发者直接来使用它。

这样操作之后，我们会得到一个 `go.mod` 文件：

```
module hello-server

go 1.21.4

```

这样，我们的包管理环境就准备完成了。

::: tip 目录与包

Go 以目录作为包（ package ）的划分，同一个目录下的所有 `.go` 文件都属于一个包。我们通常会以目录名作为这个目录对应的包的包名（但非必须），以包含项目总包名的相对路径作为具体包的引用路径。例如，项目下有一个 `utils` 目录，那么我们需要使用它里面存放的一些东西的时候，会使用 `hello-server/utils` 作为调用时的包名来书写。

Go 项目中同一目录下的文件相互之间是平等的，除了一些特殊规则如 `*_test.go` 文件指定用于存储测试代码外，其他文件名之间并不存在优先关系。也因此，对于同一个目录下的内容来说，具体放在什么名字的文件里并不重要，一般按照逻辑拆分文件就好。

但这也带来了一个问题： Go 中的包依赖关系不可以交叉，即不可以在一个包引用的另一个包中引用属于这个包的内容。如果有交叉的情况发生，一般推荐将交叉的部分单独拆散成一个新的包，来让两边引用。

一般来说，每一个目录下的所有文件都要使用同一个包，但对于 test 文件来说，它可以在原来的包名后加入 `_test` 作为一个仅供测试使用的新包，来对原始的包进行黑盒测试使用。

:::

## 开始编写代码

Go 项目以 `.go` 作为代码文件的后缀名。我们可以在项目目录下创建一个 `main.go` 文件作为整个项目的入口文件。

对最终需要打包成可执行文件的项目来说，它的入口文件有一个特别的要求：使用 `main` 作为包名。

### 从入口函数开始

光有入口文件还不够，我们还需要指定一个入口函数。特别地，它的函数名必须为 `main` 。就像这样：

```go
package main

func main() { // [!code ++]
}             // [!code ++]
```

这个函数虽然目前什么都没有做，但它依然会被执行。

### 内部库函数

我们现在希望这个函数做点什么：例如，在控制台里打印出一句 `好耶！` 。

Go 与 C 或 Python 的内置控制台打印函数不同，如果要在一个 Go 项目里往控制台打印一些字符，我们需要使用 `fmt` 这个内置包的 `Print` 相关函数。就像这样：

```go
package main

import "fmt"   // [!code ++]

func main() {
	fmt.Print("好耶！")  // [!code ++]
}
```

::: tip Go 引用包

import 行表示引用整个包，这与 TypeScript 的引用某个包的导出部分不同： Go 在引用包的时候，是将整个包都引用进来的。

并且，和 TypeScript 的一个包一个 import 不同，它可以使用圆括号 `()` 将所有需要引用的包一行一个地包起来。

:::

我们使用了 fmt 包里的 Print 函数来往控制台上打印字符串。

如果我们想打印出带有时间戳标记的日志，只需要使用 `log` 包里的 Print 系列函数就可以。就像这样：

```go
package main

import "fmt"   // [!code --]
import "log"   // [!code ++]

func main() {
	fmt.Print("好耶！")  // [!code --]
	log.Print("好耶！")  // [!code ++]
}
```

### 运行与构建

为了证明这段代码的功能，我们需要运行它。对于 Go 来说，我们可以这样来运行：

```sh
go run main.go
```

这样，我们能直接运行这个程序，并在控制台观察到想要的输出。

或者，因为我们将项目作为一个包来管理，所以也可以按照一个包一样来运行。对于 Go 命令行来说，将包的相对路径传入，例如：

```sh
go run .
```

可以起到同样的效果。

而如果需要构建出来一个可执行文件，只需要将 run 换成 build 就可以，例如这样：

```sh
go build .
```

控制台里不会有任何输出，但目录里现在多了一个以软件包命名的可执行文件 `hello-server.exe` 。使用命令行运行它，同样能得到预期中的结果。

::: tip IDE 的运行/调试配置

和开发前端一样，灵活使用 IDE 自带的运行/调试配置也能进一步优化开发与使用体验。具体的配置流程就不多赘述啦。

:::

### 变量与类型

Go 是一种强类型的语言，这就意味着我们需要更加严格地关注类型之间的关系。

它已经内置了一些常用的基础类型，可以参见 [Basic types] 。例如，我们希望声明一个数值变量，并打印出来。可以这样写：

[Basic types]: https://go.dev/tour/basics/11

```go
var someNumber int      // 声明一个名称为 someNumber ，类型为 int 的变量
someNumber = 1          // 将这个变量赋值为 1
fmt.Println(someNumber) // 打印出这个变量的值
```

Go 里有一个语法糖，可以使用 := 来将声明和赋值结合到一起，就像这样：

```go
someNumber := 1
```

使用这种方法声明的变量，会使用对应右边部分的变量类型。对于这个例子来说，它会被声明为 int 类型；而如果想要使用例如 uint 类型，我们可以这样写：

```go
someNumber := uint(1)
```

在学习 JavaScript 的时候我们已经学过，变量名就是一个指向仓库地址的门牌号，我们可以在这个仓库里放置任何 *适合放置（类型一致）* 的东西。也因此，当我们需要一个新的值的时候，可以直接沿用这个变量，而无需声明一个新的：


```go
someNumber := 1
fmt.Println(someNumber) // 打印出这个变量的值
someNumber = 2          // 将这个变量赋值为 2 // [!code ++]
fmt.Println(someNumber) // 打印出这个变量的值 // [!code ++]
```

Go 中的变量不可以被重复声明，即如果在第 3 行使用 := 的话，编译器会报错： `':=' 的左侧没有新变量` 。

利用好变量，我们就可以实现根据使用场景自动变化的功能，而无需在每次需求有所调整的时候就完全重写整个程序了。

#### 自定义类型

基础类型不能满足所有的业务需求，有时需要一些复杂的类型用来存储所需要的内容：此时可以使用 `struct` 来组合基础类型，定义得到一些复杂的类型。

例如，我们需要一个类型 `Toy` ，里面包含了这个玩具的名字、昵称和编号：

```go
type Toy struct {
	Name     string
	Nickname string
	ID       uint
}
```

这个过程有点类似于 TypeScript 的类型定义，但语法不一样。

我们也可以使用一些来自于其他包的类型。例如，我们需要包含这个玩具的出厂日期，可以这样写：

```go
type Toy struct {
	Name      string
	Nickname  string
	ID        uint
	CreatedAt time.Time // [!code ++]
}
```

这里，我们使用到了内置包 `time` 里的 Time 这个类型。

在 TypeScript 的类型定义里，往字段后面加上 `?` 表示这个字段是可选的；但在 Go 里，我们会使用指针来管理可选的类型——如果一个字段没有被设置，那么可以让它的值为 `nil` （空指针）。

```go
type Toy struct {
	Name          string
	Nickname      string
	ID            uint
	CreatedAt     time.Time
	OptionalField *string // [!code ++]
}
```

需要注意，指针类型在处理之前最好先判断一下是否为 nil ，千万不要直接拿来用——一不小心访问到无效的内存就要恐慌（panic）了。

### 顺序，选择，循环

在 Day1 中我们浅浅地提了一句三大结构，但并没有详细展开来讲；但对于后端逻辑来说，它们却是必不可少的部分。所以在这里，我们来仔细讲一讲这三个部分。

#### 顺序

顺序结构非常好理解：程序由入口点进入，从上至下执行，这就是程序执行的顺序。

就像我们做事一件一件做，说话一句一句说一样，这就是程序运行的基础时间顺序结构。

#### 选择

如果我们要判断 9 是否大于 10 ，我们应该怎么实现呢？

从程序结构的角度讲，这种根据给定条件不同，需要判断条件是否成立，从而执行不同后续逻辑的情况，叫做选择结构。 Go 里提供了一个用于判断条件是否成立的工具 if ，它的语法是这样的：

```go
if <条件> {
    // 条件成立时执行
} else {
    // 条件不成立时执行
}
```

那么对于判断 9 是否大于 10 ，我们可以这样写：

```go
if 9 > 10 {
    fmt.Println("九比十大")
} else {
    fmt.Println("九不比十大")
}
```

其中，如果条件不成立时什么都不用做的话，可以省略 else 部分，就像这样：

```go
if 9 > 10 {
    fmt.Println("九比十大")
}
```

如果想要仅在条件不成立时才执行，在条件成立的时候什么都不用做呢？我们可以对条件进行逻辑取反运算，将成立条件设定为「原先的条件不成立」来执行，就像这样：

```go
if !(9 > 10) {
    fmt.Println("九不比十大")
}
```

#### 循环

如果我们需要打印出 1 到 10 这十个数字，该怎么实现呢？

我们可以手动处理，就像这样：

```go
var someNumber int
someNumber = 1
fmt.Println(someNumber)
someNumber = 2
fmt.Println(someNumber)
someNumber = 3
fmt.Println(someNumber)
someNumber = 4
fmt.Println(someNumber)
someNumber = 5
fmt.Println(someNumber)
someNumber = 6
fmt.Println(someNumber)
someNumber = 7
fmt.Println(someNumber)
someNumber = 8
fmt.Println(someNumber)
someNumber = 9
fmt.Println(someNumber)
someNumber = 10
fmt.Println(someNumber)
```

但这样处理太低效了，我们可以定义一个计数器从 1 增大到 10 ，再在每一次变化时都将值打印出来。

Go 提供了 for 来辅助我们构建循环，就像这样：

```go
counter := 1 // 定义计数器并初始化为 1

// 循环
for {
    // 循环打印
    fmt.Println(counter)

    // 计数器自增
    counter++

    // 判断是否可以继续
    if !(counter <= 10) {
        break
    }
}
```

这里 `counter++` 是 `counter = counter + 1` 的简写， `break` 指的是结束循环。

我们可以将循环的继续条件写到 for 后面，就像这样：

```go
counter := 1 // 定义计数器并初始化为 1

// 循环
for counter <= 10 {
    // 循环打印
    fmt.Println(counter)

    // 计数器自增
    counter++
}
```

对于这种使用计数器来控制的循环来说，我们还可以把初始化条件和自增工作也结合到 for 后面，就像这样：

```go
for counter := 1; counter <= 10; counter++ {
    // 循环打印
    fmt.Println(counter)
}
```

灵活使用各种语法糖，可以让我们的程序变得优雅又简洁。

### 定义一个函数

对于面向业务逻辑的程序来说，把所有的代码都写在 main 函数里是一个非常坏的习惯。我们应该如何定义一个新的函数，将代码适度地拆分出去呢？

例如，我们实现一个[星期几计算]函数，传入年月日，计算出这一天是星期几，以及是不是周末（周六周日）。我们可以这样写：

[星期几计算]: https://en.wikipedia.org/wiki/Determination_of_the_day_of_the_week

```go
// calcDoW : 星期的计算，使用 Gauss's algorithm 的 Disparate variation
func calcDoW(year int, month int, day int) (int, bool) {
	d := day
	m := (month+9)%12 + 1
	Y := year
	if m == 11 || m == 12 {
		Y -= 1
	}
	c := Y / 100
	y := Y % 100

	dow := (d + int(2.6*float64(m)-0.2) + y + y/4 + c/4 - 2*c) % 7

	return dow, dow == 6 || dow == 0
}
```

我们可以这样测试这个函数：

```go
// 此处放置 calcDoW 函数

var dowPrintMap = map[int]string{
	0: "日",
	1: "一",
	2: "二",
	3: "三",
	4: "四",
	5: "五",
	6: "六",
}

func main() {

	demoDays := []struct {
		y int
		m int
		d int
	}{
		{2008, 12, 10},
		{2008, 2, 10},
		{1842, 8, 29},
		{2024, 3, 7},
	}

	for _, demoDay := range demoDays {
        // 计算
		dow, isWeekend := calcDoW(demoDay.y, demoDay.m, demoDay.d)

		// 输出
		fmt.Printf("%d年%d月%d日是星期%s", demoDay.y, demoDay.m, demoDay.d, dowPrintMap[dow])
		if isWeekend {
			fmt.Printf("，是周末")
		}

		// 换行
		fmt.Println()
	}

}
```

我们会使用驼峰命名法(camelCase)来为自定义函数命名。另外， Go 对于函数名称有这样的要求：

1. 在定义函数时，不能使用 main 和 init 这两个保留函数名；
2. 定义一些需要被其他的包使用的函数时，需要首字母大写，例如针对这个星期计算函数，就要求命名为 `CalcDoW` 这样。

### 使用外部库

Go 有强大的内置库用来处理一些基础工作，您可以在有空的时候多去体验体验；而对于一些具有优化或应用专有意义的操作来说，我们可以使用丰富的外部库来扩充使用场景。

对于已经初始化了 go mod 的项目来说，拉取一个外部库非常简单，只需要这样的指令就可以：

```sh
go get <外部库>
```

特别地，为了在引入依赖的同时尽量使用最新的依赖版本，我们可以加入 -u 参数，就像这样：

```sh
go get -u <外部库>
```

Go 会将下载下来的库缓存到 `$HOME/go` 下的的 pkg/mod 目录，对我来说就是 *C:\Users\Candinya\go\pkg\mod* 这里。

::: tip 整理依赖

在引入一些外部库后，当我们编译运行项目时，可能会弹出一些 `missing go.sum entry` 的提示，这种时候我们通常可以尝试整理一下依赖之间的关系，来去掉其中没有使用到的部分，补充缺失的那些。 Go 提供了一个指令用来自动处理这部分的需求：

```sh
go mod tidy
```

:::

Go 有非常丰富的外部库可以使用，这里只简单列举几个我用得比较多的。

#### 读取 yaml 格式的配置文件

当配置文件相对来说较为复杂的时候，我喜欢用 yaml 来书写它，从而规避掉 json 中的逗号问题。 Go 内置了 json 的支持库（性能不是最强但足够使用），但没有 yaml 的。我会喜欢使用 `gopkg.in/yaml.v3` 这个库来处理。

首先引入这个包：

```sh
go get -u gopkg.in/yaml.v3
```

我们假设配置文件的结构长这样：

```yaml
system:
  debug: true
extend:
  - name: name1
    attribute: demo
  - name: name2
    attribute: demo
  - name: name3
    attribute: demo
```

它对应的 Go 结构长这样：

```go
type Config struct {
	System struct {
		Debug bool
	}
	Extend []struct {
		Name      string
		Attribute string
	}
}
```

那么，对于 yaml 来说，我们需要补充上对应的字段映射关系。就像这样：

```go
type Config struct {
	System struct {
		Debug bool `yaml:"debug"`
	} `yaml:"system"`
	Extend []struct {
		Name      string `yaml:"name"`
		Attribute string `yaml:"attribute"`
	} `yaml:"extend"`
}
```

此时，我们就可以这样读取并解析配置文件：

```go
configFileBytes, err := os.ReadFile("config.yml")
if err != nil {
    log.Fatalf("配置文件读取失败")
}

var cfg Config

if err = yaml.Unmarshal(configFileBytes, &cfg); err != nil {
    log.Fatalf("配置文件解析失败")
}

log.Printf("配置文件： %v", cfg)
```

::: tip 猜猜1

如果 `System` 使用首字母小写，会得到怎样的结果？

提示：想想函数名首字母大小写对包外调用的影响。

:::

#### 创建一个 HTTP 服务器

Go 有内置的 http 包，可以用于实现一个简单的 HTTP 服务器，但它使用起来有些许的繁琐，并且缺少一些内置的功能。我喜欢使用 `github.com/gin-gonic/gin` 或是 `github.com/labstack/echo/v4` 这两个框架。我们以 echo 为例。

```sh
go get -u github.com/labstack/echo/v4
```

复制官方仓库 ReadMe 里的代码：

::: code-group

```go [添加到 main 函数的部分]
// 创建一个 echo 实例
e := echo.New()

// 准备中间件
e.Use(middleware.Logger())
e.Use(middleware.Recover())

// 准备路由
e.GET("/", hello)

// 开始监听服务器
e.Logger.Fatal(e.Start(":1323"))
```

```go [添加到 main.go 文件的自定义函数]
// 处理函数
func hello(c echo.Context) error {
	return c.String(http.StatusOK, "好耶！")
}
```

:::

运行程序，我们会发现它在启动之后并没有自动停止：这是正确的，因为我们希望它作为一个 HTTP 服务器，能开始接收来自外部的请求。

我们使用浏览器打开 http://localhost:1323 ，可以看到页面上打印出了 `好耶！` ，并且我们的程序控制台也输出了一行请求日志。这样就实现了一个非常简单的 http 服务端。

::: tip 猜猜2

只访问了一次页面，为什么控制台里输出了两行请求日志呢？

提示：和浏览器的默认行为有关， Day2 我们遇到过的。

:::

#### 使用 ORM 连接数据库

我们经常使用数据库来管理数据，包括但不仅限于关系型数据或是非关系型数据。这里以关系型数据库 Postgres 为例，简单讲一讲用 GORM 连接过去并完成一些基本 CRUD 操作的流程。

::: warning 启动 Postgres

因为 Postgres 是一个外部组件，我们要先启动它才能让我们的程序连接过去。

我推荐使用 Docker 启动一个 Postgres 容器，但因为 Docker 的部分暂时还没讲到，所以这部分可以先只是有一个印象就好，不用太纠结于立刻实践。

当然，如果知道怎么跑容器的，也完全可以先试一试玩起来。

:::

```sh
go get -u gorm.io/gorm gorm.io/driver/postgres
```



#### 连接到 Redis

Redis 是一个高效的 K-V 数据库（非关系型），一般我会用它来存储一些临时性的东西，比如会话的认证标识、一些读取缓存之类的数据，通过绕开这些非关键数据对数据库的频繁读写来尽可能优化性能。

::: warning 启动 Redis

因为 Redis 也是一个外部组件，我们也要先启动它才能让我们的程序连接过去。

我也推荐用 Docker 。

:::

```sh
go get -u github.com/redis/go-redis/v9
```

#### 优化日志

虽然 Go 自带的 log 已经足够处理一般日志和错误日志了，但为了更加精细的日志分级，我会喜欢使用 zap 这个日志工具。

```sh
go get -u go.uber.org/zap
```

### 拆分目录

当我们的项目逐渐变得庞大的时候，一个干净的结构对进一步的维护工作来说是必不可少的。

通常按照我的习惯，我会把功能类似的东西放到一起：例如将辅助函数放到 utils 目录，将 HTTP 服务相关的处理函数放到 handlers 目录，将常量放到 consts 目录，将模型放到 models 目录等等。

对于多组件的大仓来说，我会将不同组件的主函数放到 app 目录下的对应名称，将具体的模块根据是否共用分别放到 common 或对应组件的目录下，将部署相关的东西放到 deploy 目录这样。

具体的还是要看个人的习惯（和项目的代码风格），没有什么是绝对标准的（反正人和程序至少得有一个能跑），例如如果是接手别人开发的项目的话最好能遵循原有的风格，避免可能出现的异常冲突或是给进一步维护带来习惯上的困难。

## 今日总结

今天讲的主要是一些零零碎碎的 Go 知识，限于篇幅原因没法讲得非常详细，如果有什么不明白的欢迎随时留言 :pray:

## 课后挑战
