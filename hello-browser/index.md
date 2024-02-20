# 我的第一个前端项目：Hello browser

欢迎回来。

::: details 杂谈：项目开坑

在休息的这几天里我在想，要不要现在直接开一个完整的项目坑来开发，作为贯穿这整个文档的主线任务；但仔细考虑了之后还是打消了这个念头。开一个完整的项目需要考虑的东西太多，不是现在入门阶段能处理好的，如果毛毛躁躁没把基础打好就开始往上堆砌的话，可能会导致很多严重的问题。

所以我在想，与其压缩工期弄出一个惨不忍睹的烂尾楼，倒还不如就先静下心一步一步走，把项目的管理和设计单独弄成下一个课题来讲。等到这个课题结束的时候，您拥有了对于整个前后端流程的认知，这样的时候再按照项目管理的流程来体验一遍，或许更加合适。

:::

言归正传，今天我们要讲的是如何使用以 React 为例的现代前端工具，配合一些颇具盛名的组件库搭建出一个我们喜欢的项目。

::: tip 为什么选择了 React

没有什么特别的原因，只是我近来写 React 写得比较多所以更加熟悉而已； Vue 也同样非常好用，并且因为是国人最早开发的所以中文相关的文档资料会更加丰富一些，一些使用体验上或许也会更加贴合国内开发者的习惯。您现在看到的这个文档就是使用 [Vitepress](https://vitepress.dev/) 构建的，它的底层就是 Vue ，非常好用。

:::

## 选择工具

昨天（~~其实已经是好几天前了~~）我们提到，传统的三大件前端开发在项目管理上太过紧凑，在优化逻辑上太过松散；现代前端工具的出现就是为了解决这个问题：把组件拆散，把优化与发布逻辑聚合到一起，让每个人都能用一样的工作流来构建一个大型的项目。

我们就先来看有什么工具可以使用。

如果您看过其他 React 教程，可能里面会出现不少 [CRA (Create React App)] 这个工具。确实，这个工具是由 React 官方推出的；但因为其使用了 Webpack 作为构建内核，在性能上已经不如现在的主流构建工具来得好用；再加上它已经好久没有更新，官方都已经不再推荐使用它了（[create-react-app#13072] ）。

我个人使用得比较多的有两个，一个是 Vite ，一个是 Next.js 。 React 官方还推荐了一些[其他工具]，但我了解得不是太多。

- [Vite] 我在 CSR 就可以覆盖的场景使用
- [Next.js] 我会在需要 SSR 的场景使用

::: tip CSR 与 SSR

这里的 CSR 不是指动车， SSR 也不是指抽卡超级稀有。这两个缩写的完整展开和对应的意思分别是：

- CSR: Client Side Render ，客户端渲染
- SSR: Server Side Render ，服务端渲染

CSR 会在构建的时候把项目构建成单一的 html 文件和资源的组合，通过在客户端（浏览器）上判断路径来进行不同页面的选择渲染。对于浏览器来说，无论访问什么路径，它都只是加载了一个一模一样的 index.html ，剩下的具体页面上不同内容的渲染、和后端服务的交互等操作全部都由 JS 来实现。它的优势就是构建之后就是纯静态的资源，因此可以非常方便地托管到一些纯静态的托管平台，例如各种 Pages 上；它的劣势也很明显，因为每一个页面都是一模一样的 html 文件，因此在 head 标签里的内容也完全一致，对于不带渲染功能的搜索引擎爬虫来说就很不友好， SEO 表现也会欠佳。

SSR 则与之相反，主要的渲染工作都由服务端来完成，客户端（浏览器）加载到不同的页面上得到的内容也不一样。例如，不少非常经典的 PHP 项目使用的就是 SSR 的工作模式（新一些的用了 Laravel 的可能会使用现代前端开发方法）。这么做能显著优化 SEO ，即针对不同的页面对应生成不同的内容；并且对于客户端的渲染压力也会小一些。缺陷就是它必须运行一个服务端，因此不能部署到纯静态托管平台去。

那么，有没有一个折中的办法呢？这就是 SSG (Static Site Generation ，静态站点生成) 来实现的了。 SSG 会将独立的页面渲染成独立的 index.html ，兼具 SSR 的 SEO 友好特性和 CSR 的纯静态特性，因而非常适合于一些内容固定的场合，例如 blog ，或是像现在这个课题这种教程。对于那些需要动态地生成内容页面的场合，就还是乖乖地使用 SSR 吧。

:::

::: details SEO 是什么

Search Engine Optimization 搜索引擎优化，指通过一些技术手段，例如 meta 标签或是 OpenGraph 等，让搜索引擎更好地了解到当前站点（页面）在做些什么，从而提升当前页面的搜索精准度和排名，让用户在搜索相关的关键词时更容易访问到当前页面的机率。

这通常来说是一件好事，但如果利用了这种机制来欺骗搜索引擎，为了提升自己的排名硬是塞一些完全无关的东西进去，那就会变成内容农场那种极端案例。

:::

因此，在一些作为只给用户交互使用的工具场合，我会更喜欢使用 Vite 之类构建成纯前端的工具；在一些需要提供服务、使用 API 中间件的场合，我会使用 Next.js 。

这个课题中，我们以 Vite 为样例。

[CRA (Create React App)]: https://create-react-app.dev/
[create-react-app#13072]: https://github.com/facebook/create-react-app/issues/13072
[其他工具]: https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks
[Next.js]: https://nextjs.org/
[Vite]: https://vitejs.dev/

## Node.js 的包管理工具

- Node.js 自带一个包管理工具 **npm** ，但因为它速度较为缓慢（尤其是在国内网络环境下），并且会在项目里产生一个体积巨大的 `node_modules` 依赖目录，所以并不是非常好用。
- 您可能会在一些其他教程里看到 **yarn** 这个包管理软件，它使用了自己的镜像源，所以速度比 npm 快不少；但它也无法复用依赖项目，并且各个大版本之间的差距比较巨大，版本没对上（有些教程里使用的还是 v1 ）可能导致一些异常的情况发生，所以也不是非常推荐。
- 我自己比较常用的是 **pnpm** ，它最大的优势是能在各个项目中复用依赖，从而能较为显著地减少对于硬盘的占用。
- 另外我有听说过 **bun** ，据说非常好用，或许有机会我可以试一试。

pnpm 的安装非常简单，可以参考[官方文档](https://pnpm.io/zh/installation)中的描述。如果把握不准应该使用哪一条指令的话，可以直接使用 npm 安装：

```shell
npm install -g pnpm
```

这样安装的 pnpm 会作为 Node.js 的一个系统级别的工具，之后无论是使用还是升级都会非常方便。

当然，您也可以使用其他您喜欢的方式来安装。


::: details 运行指令

从今天开始，我们会涉及到不少需要使用指令来操作的场合。

- 每个系统上都有内置的终端用于运行指令，例如 Windows 上的 CMD 或是 PoweShell ， \*nix 上的 Terminal ；
- 不少开发工具也自己集成了一个运行指令的窗口，例如对于 VSCode 可以使用 `Ctrl` + `~` 唤起， JetBrains 系的可以点击左下角的 `终端` 按钮来打开。

![JetBrains 的终端](./attachments/jetbrains-terminal.png)

如果您觉得系统自带的终端不够好看，没关系，我们还有很多替代的选择。

- 对于 Windows 用户来说，微软开发了一个非常漂亮的终端工具 [Windows Terminal] ，在支持安装应用的一般发行版上可以使用（ LTSC 不可用 :sob: ）；
- 对 macOS 用户来说，我印象里有见到别人使用 [iTerm2] 。

另外，也可以对终端本身进行一些交互优化。
- 在 Windows 上我默认使用的是 PowerShell ，具体的优化流程已经无法考证，找到了一篇或许可以参考的教程 [Add a Bash-like autocomplete to your PowerShell] ；
- 对 \*nix 系统上的 zsh ，我使用的是 [oh my zsh] 美化了一下，让它看上去更友好一些。

[Windows Terminal]: https://github.com/microsoft/terminal
[iTerm2]: https://iterm2.com/
[Add a Bash-like autocomplete to your PowerShell]: https://dev.to/ofhouse/add-a-bash-like-autocomplete-to-your-powershell-4257
[oh my zsh]: https://ohmyz.sh/

:::

## 创建一个项目

Vite 创建项目时会自动创建一个项目目录，所以我们不需要手动来创建它。

进入我们的工作区，打开一个您喜欢的终端窗口，运行这样的指令：

```shell
pnpm create vite hello-browser --template react-ts
```

其中， `hello-browser` 是我们的项目名称，而 `react-ts` 是我们使用的模板。

::: tip

Vite 还可以使用非常多其他的模板，如果您不确定具体该用哪一个的话，可以这样来交互式地创建项目：

```shell
pnpm create vite
```

:::

您会得到形如这样的输出：

```log
../../../.pnpm-store/v3/tmp/dlx-44456    |   +1 +
../../../.pnpm-store/v3/tmp/dlx-44456    | Progress: resolved 1, reused 1, downloaded 0, added 1, done

Scaffolding project in D:\Projects\full-stack-in-7-days-repos\day3\hello-browser...

Done. Now run:

  cd hello-browser
  pnpm install
  pnpm run dev

```

这些输出的意思是已经在 `D:\Projects\full-stack-in-7-days-repos\day3\hello-browser` 这个目录下初始化了项目草稿，我们要进入项目并开始开发工作的话，只需要运行这些指令：

```shell
cd hello-browser
pnpm install
pnpm run dev
```

1. 第一条的意思是进入刚刚创建的这个目录，也就是我们的项目目录。
2. 第二条的意思是使用 pnpm 安装项目的依赖。
3. 第三条的意思是使用 pnpm 运行名称为 dev 的脚本。

我们先使用喜欢的开发工具打开这个新生成的 `hello-browser` 目录，再来依次检查这些指令。

## 基础结构

一般的开发工具都会带有一个树状结构的资源展示页面。如果您展开所有的目录，您会看到这样的一个结构：

![项目结构](./attachments/project-structure.png)

这里的每一个目录和文件都有其独特的作用。

- `public` 目录下的文件会在构建过程中被无变化地移动到目标目录，适合用于存放一些和代码关系不大，但在项目的最终发布中需要包含的东西，比如网页的图标，或是一些需要引用的静态资源。
- `src` 目录下的是项目的源代码，也就是我们项目的主要核心部分。
- `.eslintrc.cjs` 是 eslint 这个代码格式化工具的配置文件。但其实我更喜欢用 [Prettier] 。
- `.gitignore` 文件是在使用 git 作为版本管理工具时，用于指导 git 应该忽略哪些文件不加入版本管理中。通常，我们会把一些日志、依赖、缓存和构建结果等放在这里。
- `index.html` 是项目的主入口文件，也就是昨天我们的三大件中的 `index.html` 。但又有些不同——这个文件的 `script` 标签在构建之后会有一些变化，以及会引入构建之后的 CSS 样式。可以在这里自定义一些我们昨天提到的例如标题或是图标之类的元数据。
- `package.json` 对于一个 Node.js 项目来说就像是心脏，它指导了整个项目的各项具体信息，包括名称、版本、类型、脚本、依赖等等，是最重要的文件之一。
- `README.md` 通常会被认为是一个项目的说明书。它使用 [Markdown] 语法编写。
- `tsconfig.json` 和 `tsconfig.node.json` 是 TypeScript 的配置文件。一般情况下不需要去动它，但我们可以使用一些小技巧来优化我们的路径写法。我们稍后会来处理。
- `vite.config.ts` 是 vite 这个打包构建工具的配置文件，如果不是需要安装一些额外的插件之类的话，一般不用去动它。

[Markdown]: https://zh.wikipedia.org/wiki/Markdown
[Prettier]: https://prettier.io/

打开开发工具的指令执行终端，我们先检查一下刚刚认识的三位指令朋友。

第一条指令是对于刚创建完项目时候，在项目外面使用的；因为我们使用开发工具直接打开了项目目录，您会发现指令执行终端的路径已经是项目目录里面了，所以这条就不用执行了。

第二条指令是需要执行的。通常，在项目的依赖发生变更之后，我们会使用这条指令来根据 `package.json` 文件中的 dependencies 和 devDependencies 两项里列出的依赖进行本地同步。对于刚创建的项目来说，可以理解为依赖从无到有的变化，所以也需要一次初始同步。

::: tip

pnpm 提供了一些指令的别名（ alias ），例如 `pnpm i` 就可以起到和这条指令同样的作用：其中的 `i` 代表了 install 。

:::

执行完这条指令后，我们会看到项目目录中多出了 `node_modules` 目录和 `pnpm-lock.yaml` 文件。

- `node_modules` 目录存放的是项目的实际依赖。由于不少 Node.js 项目依赖多尔繁杂，并且包含大量的零碎文件，默认的包管理会完整复制这些依赖文件，所以这个目录有时也被称为「宇宙中最重量级的东西」。
- `pnpm-lock.yaml` 是 pnpm 安装的具体的依赖项的详细版本号。与 package.json 文件中仅仅是标注依赖名称和版本号不同，这个 lock 文件里面的内容更为精细。一般来说它的存在感不是很强，但有时由于错综复杂的依赖关系可能会导致一些奇怪的冲突问题出现，而要想让自动构建流水线能正常地执行，就需要利用这个文件来指定应该安装哪些具体的依赖项。

针对第三条指令的执行，因为我们每次开启项目用于调试都会用到它，所以比起直接在终端里一次次地输入，我会推荐一种更加取巧的办法：利用好开发工具的运行/调试配置管理工具。

针对 WebStorm ，它是右上角的这样一块区域：

![WebStorm 的运行/调试配置](./attachments/webstorm-run-debug-config.png)

我们可以点击「当前文件」右边的下箭头，选择 编辑配置 ，在弹出页面中创建一个新的 npm 运行指令：

![创建一个新的 npm 运行指令](./attachments/create-npm-dev-script.png)

::: tip 用 npm 而不是 pnpm 运行会有影响吗

就运行脚本的角度来讲，可以认为是等价而没有影响的。反正只要别用 npm 来管理依赖就好。

:::

在确定之后，我们可以看到运行/调试配置变成了现在这样：

![设置好的运行/调试配置](./attachments/webstorm-run-debug-config-configured.png)

此时点击绿色的 ▶ 按键，就可以看到 WebStorm 开始运行第三条指令了。

![开始 npm run dev](./attachments/start-run-dev.png)

按下红色的 ⏹ 按键，就可以看到运行进程被结束了。

## 准备工作

在正式开始写代码之前，我们先来关注一下刚刚提到的两件事：代码美化和目录优化。

Vite 初始化的项目自带一套 eslint 的配置可以开箱即用，而我更喜欢简单易用的 Prettier ，所以我会选择去掉这个 eslint ，改成 [安装 Prettier] 并 [配置 Git 钩子] 以方便在提交的时候自动格式化变化了的文件。 

有趣的是，其实并不一定需要二选一—— Prettier 也可以使用 eslint 的配置，与之友好共存。具体就看您的需要了。

[安装 Prettier]: https://prettier.io/docs/en/install.html
[配置 Git 钩子]: https://prettier.io/docs/en/install.html#git-hooks

目录优化的意义在于有一个对 src 目录的相对路径可以稳定使用，从而避免项目过大时，目录之间相对路径关系复杂造成迷惑。实现起来也非常简单，只需要添加一段路径补充放到 `tsconfig.json` 里面就可以，完整的文件会看起来是这样：

```json{23-27}
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path */
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

不要忘记在第 21 行后加一个英文逗号哦。

这样设置完成之后，当我们想要调用一个例如是在 src 目录下的 example.tsx 文件时，就可以直接写成 `@/example.tsx` 这样啦。

## 开始编写代码

### 先从改动开始

### 新建一个组件

### 组件与目录

## 使用组件库

### 安装组件库

### 使用组件

## 更大的项目

### 路由管理

### 状态管理

### 请求管理

## 今日总结

## 课后挑战
