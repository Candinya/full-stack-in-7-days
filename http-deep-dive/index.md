# 连接起前后端的红绳

首先，恭喜您完成了超过一半的课题内容。能坚持看到现在非常不容易，尤其是在前两天经历了前后端的大量知识冲击之后。这个课题安排非常紧凑，所以可能您会感到困惑，这是正常的——我之前没有写过这种短周期的系统性教程。所以，记得有任何问题随时提出，有任何想法随时表达；无论是对自己的了解，还是对于改进这个话题，为其他人提供可能的帮助，也都是有好处的。

::: tip

今天的内容是对 HTTP 的深度解析，会非常的枯燥，对于实际开发来说的帮助没有那么立竿见影，更多的是讲一讲一些具体的细节和可以用来提升开发者友好程度相关的东西。如果您觉得没有兴趣看下去，可以暂时先不来看这些。

:::

在对基础的前后端知识有一个简单的了解之后，今天我们来讲讲它们背后共通但又有所不同的东西，也是一位我们熟悉的新朋友： HTTP 。

## 什么是 HTTP

HTTP 的定义非常简单，就像 HTML 一样， HTTP 就是 **H**yper**T**ext **T**ransfer **P**rotocol 的缩写。翻译过来，就是一个用于传输 `hypertext` 的协议。如果您了解过 [OSI 七层模型]，一般认为它运行在 Layer 7 *应用层*， Layer 4 的 TCP/IP ( HTTP/3 也会用到 QUIC ) 是它的基础。我们会在 Day 7 来讲一讲关于分别对应这两大层的防护技术。

[OSI 七层模型]: https://en.wikipedia.org/wiki/OSI_model

还记得您第一次听说 HTTP 的时候吗？或许是输入网址时候的 `https://...` ，或者是在网站上看到的某个可以点击的链接。它是什么？

### URL 的解析

对于形如这种的东西，我们称它为一个 URL ，它可以用来定位到网络上的一处资源。 [RFC3986] 中定义了非常详细的规范，这里只给出我们常用的一个缩略范例（方括号中的内容表示可以省略）：

[RFC3986]: https://datatracker.ietf.org/doc/html/rfc3986

```
scheme://[userinfo@]hostname[:port]path[?query][#fragment]
```

例如，对于一个形如 `http://localhost:1323/?start=1&end=100` 的链接来说，它的各个部分分别是这样的：

| 部分     | 值              |
| -------- | --------------- |
| scheme   | http            |
| userinfo |                 |
| hostname | localhost       |
| port     | 1323            |
| path     | /               |
| query    | start=1&end=100 |
| fragment |                 |

- scheme 是协议。最常见的协议有 HTTP 和 HTTPS ，其次我想或许不少人用过 mailto 、 ftp ，或是 smb 等等。还记得我们昨天用来连接数据库和 redis 时使用的以 `postgres` 和 `redis` 开头的字符串吗？这两个字符串也是 URL ，这两个开头也是协议。
- userinfo 是指用户信息。一个简单的例子就是邮件地址，例如 `example@nya.one` 来说， `example` 就是 userinfo 。另一个较为常见的案例是使用 HTTP Basic Authentication 作为认证方案的场景中，使用 `username:password` 这样的格式来编码用户名和密码。
- hostname 是指主机名，这应该是我们最常使用的部分。例如，我们记忆喵窝的地址的时候，可以使用 `nya.one` ——这就是域名格式的主机名。或是例如在维护路由器的时候，我们会使用 `192.168.0.1` ，这个是以 IP 格式呈现的主机名。
- port 是指端口。通常当我们使用 scheme 对应的默认端口（ HTTP 80 / HTTPS 443 ）时可以省略它，也因此我们并不常在一些在线服务上看到它；但对于因为出于种种原因没有使用默认端口，例如本地调试，或是在国内自己家里部署可供外部访问的服务器时，则需要指定它。
- path 是路径。这个就像文件路径一样，没有什么特别的。
- query 是查询，用于传递一些参数。这个参数一般主要出现在搜索引擎的搜索时，或是在一些跳转路径中较多出现。不同的查询参数使用 `&` 连接，同名的查询参数会被认为是数组元素。
- fragment 通常用于指定某个页面上的指定位置，例如在浏览器默认行为中可以用来定位到对应的标题。对于使用 hash route 的 SPA 应用来说，它可以被用于存储路由。这个参数仅在浏览器内部生效，不会被发往服务器。

::: tip URL 与 URI

您可能会听说过 URI 这个缩写。 URI 乍看之下好像和 URL 差不多，但它的范围更广一些： URL 是用于 locate 一个 UR ，而 URI 仅仅是一个 identifier ，它还包含了 URN 这个不用于 locate 资源的纯 name 结构。

在 HTTP 请求领域，我们一般使用 URL 比较多，在一些时候也可能会使用到 URN ，但这又是后话了。

:::

### 发出一个请求

有了一个 URL 之后，我们应该如何发出请求呢？

HTTP 以报文的格式在服务端与客户端（例如浏览器）之间通讯。一个 HTTP/1.1 以及更早的 HTTP 协议报文是语义可读的，一个请求报文分为 请求行、 请求头 、 请求体（可选）三大部分。我们分别来看它们。

#### 请求行

一个请求行由三个使用单空格分隔的部分组成：请求方法 (method) 、请求路径（包含 query）和请求使用的 HTTP 版本号。它长这样：

```
GET /full-stack-in-7-days/welcome-to-http/ HTTP/1.1
```

##### 请求方法

首先是请求方法。 HTTP 中定义了许多请求方法。根据我个人的开发使用习惯，我会把它们分成两类：

- 常用的： `GET` `POST` `PUT` `PATCH` `DELETE`
- 不常用的： `HEAD` `OPTIONS` `CONNECT` `TRACE`

我们先来看看常见的方法。

- 先说最常见的 GET 。还记得我们昨天写 echo 服务时候使用的这行代码吗？

  ```go line-numbers=18
  e.GET("/", hello)
  ```

  这里的 `GET` ，就是 HTTP 方法里的 GET 。这是因为浏览器在打开一个 URL 时，默认使用的是 GET 方法。

  GET 方法非常简单，一般被用在只读的获取数据场合。它不能携带请求体（可以被服务端忽略），所以所有需要的参数一般通过在路径中的 query 来传递，或是对于包含动态路径的场合使用路径来传递：就像昨天课后挑战里的样例程序，我们通过 query 来向 echo 服务器传递所需的起始和结束参数；对于这个课题的文档项目来说，通过不同页面的路径不同来对应获取。虽然 HTTP 对 URL 的限制非常宽泛，并且会使用编码来传递一些非 Ascii 字符，但一般我们不推荐使用 GET 请求来做一些会对服务器数据产生影响的操作——限制太大，实在没必要。

- 第二常用的是 POST 方法。相较于 GET 方法的限制来说，它因为可以携带请求体，所以通常会被用在需要对服务器数据进行改动的场合。传统的 HTTP 请求，例如表单提交中，通常会指定 method 为 POST 来调用它。使用请求体来传递参数有两大好处：一是不会干扰到 URL 从而避免让浏览器的历史记录变得混乱，让链接变得冗长；二是能用来传递一些非常大块的请求数据，例如文件上传——可以使用 `multipart/form-data` 来编码它们。

- 那么， PUT 和 PATCH 又是什么呢？

  其实，就效果来讲，它们和 POST 并没有什么区别：甚至从纯技术角度来讲，您完全可以用 PATCH 请求来创建资源：但这种反直觉的设计一般不推荐使用在愚人节恶搞之外的场合——实在是太不像是碳基生物能整出来的让人眼前一黑的活了。用 PUT 来统一创建或更新资源的操作倒也还挺好用，在创建指定标识的资源时可以更方便开发者的使用。从语义上来讲， PUT 是指使用一整个新的数据来替换掉旧的，而 PATCH 则是对指出项目的修改。

- 至于 DELETE ，它的限制同样是不能携带请求体，因而需要使用路径或是 query 来传递需要被删除的资源标识；但它与 GET 不同的是，在语义上它是会对后端数据产生影响的，即一份数据在被删除之后无法再被操作（取消删除除外），因而也有其特殊的使用场景。

由此我们可以发现，在上述这些较为常见的请求方法中，最不受限制、功能丰富、语义限制小的是 POST ；一些应用（如 Misskey ）会将其所有的操作都使用 POST 进行封装，以避免语义上的歧义导致开发工作的管理出现困难；或是对于像 GraphQL 这种由客户端构建查询请求的接口封装方案来说，因为它的每一次请求都需要包含类型结构体、包含具体操作的参数，因而全部使用 POST 方法来进行封装是一种较为常用的设计。

另一种想法也很直接，即较为严格地遵循每一种方法对应的语义，来进行对应接口的封装，这就是著名的 RESTful API 规范了。我们之后会稍微再展开讲一讲这两种主流规范之间的关系和适用场景。

我们再来看看这些不太常见的方法。

- HEAD 用来获得目标资源的响应头，忽略掉目标资源的请求体：可以用在例如多线程下载时，请求文件大小并进行下载分段初始化的场景中；或是像 S3 请求中，用于获得文件元数据的时候。它类似 GET ，但不会获得响应体，因而非常适用于一些仅需要元数据，而不需要在意具体内容的场合。
- OPTIONS 多见于在跨域请求 (CORS) 前检测目标服务器是否可被调用时，浏览器自动发出的 [preflight 请求] 场景。我似乎没有见到过主动使用它的情况。
- CONNECT 和 TRACE 就更少见了，我没有在实际使用场景中见到过它们。参见 MDN 文档 [HTTP 请求方法] 中给出的提示信息，我们可以更好地了解它们。

[preflight 请求]: https://developer.mozilla.org/zh-CN/docs/Glossary/Preflight_request
[HTTP 请求方法]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods

##### 路径

路径就是 URL 规范里的 `path[?query]` 这一部分，没什么好展开讲的，我们主要来简单了解一下版本号。

##### 版本号

目前最广泛使用的是 HTTP/1.1 ，它是一个发布于千禧年之前的 HTTP 标准，虽然非常古老，但其实现了 HTTP 通信及一些升级协议所必需的组件，也因此时至如今也依然具有强大的生命力。

但随着互联网带宽不断扩展，对于多媒体和复杂内容的需求也逐渐增加， HTTP/1.1 的旧设计中没有考虑到的情况限制了其传输的峰值性能。 2015 年， HTTP/2 被推出：它并没有改变 HTTP/1.1 的应用层结构定义（保留了对请求方法、请求路径、响应状态等的等效支持），而是从传输编码和数据流优化的角度入手：使用二进制编码来替代可读的文本编码；将消息封装成帧 (frame) 来传输；并使用多路复用技术来提升在同一个 TCP 连接中可以传输的数据，从而避免在多次请求时反复创建连接造成的不必要性能开销问题。时至今日，现代互联网上已经有不少网站支持了基于 HTTP/2 的连接。

HTTP/3 的出现则更像是对传统 TCP/IP 通信为主的历代 HTTP 协议的一次革新。它使用了 QUIC 协议进行通信，从而解决了 HTTP/2 协议的多路复用中 TCP 的丢包恢复限制——对于 HTTP/2 来说，任何 TCP 连接中的丢包中断都会阻塞整条数据流，导致并用该条流的响应出现延迟； HTTP/3 使用的 QUIC 自带有多路复用支持，在出现请求丢包时只有该包所在的数据流会出现延迟，其他的部分仍然都正常传递，从而在不是非常稳定的网络场景下会拥有更为优秀的性能。另外， QUIC 使用的 UDP 也不需要像 TCP 那样三次握手之后才能通信，在连接的起始阶段也能达到相当优异的首字节响应 (TTFB) 速度。

有趣的是，它们和 TLS 加密之间的关系也是层层递进的。 HTTP/1.1 中的加密是可选的，而在 HTTP/2 和 3 中则对于 TLS 加密提出了一些要求。这也就是为什么我们在本地打开的 http 连接通常都是 HTTP/1.1 ，因为本地连接时仅需考虑显示与交互上的正确性，安全性上考虑则更多的来源于生产环境部署场景的需求。

::: info 如果您有兴趣继续深入了解一下它们，这里是一些可以尝试的阅读材料：

- [HTTP | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)
- [HTTP/2 - Wikipedia](https://en.wikipedia.org/wiki/HTTP/2)
- [什么是 HTTP？为什么 HTTP/2 比 HTTP/1.1 快？ | Cloudflare](https://www.cloudflare.com/zh-cn/learning/performance/http2-vs-http1.1/)
- [HTTP/3 - Wikipedia](https://en.wikipedia.org/wiki/HTTP/3)
- [Comparing HTTP/3 vs. HTTP/2 Performance | Cloudflare Blog](https://blog.cloudflare.com/http-3-vs-http-2)

:::

#### 请求头

再让我们看回 HTTP/1.1 。在请求行结束之后，我们来看请求头，也就是这样的一组 KV 键值对：

```
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,ja;q=0.7
Cache-Control: max-age=0
Connection: keep-alive
Cookie: userToken=n9ijka719lgmnu99o5p5ve; Webstorm-c0f4a935=f6070343-711c-43b6-93bd-e7106453c340
Host: localhost:5173
Referer: http://localhost:5173/full-stack-in-7-days/welcome-to-http/
Sec-Fetch-Dest: document
Sec-Fetch-Mode: navigate
Sec-Fetch-Site: same-origin
Sec-Fetch-User: ?1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36
sec-ch-ua: "Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
```

不要害怕，我们一点一点来看。

首先是结构。您会发现每一行请求头都是 `Key: Value` 的结构，即使用一个冒号和一个空格将键值分开。键的名称通常是短划线（减号）分割的首字母大写的单词组合，但也有一些没有大写的场景；值则是千奇百怪的结构，但都在一行之内。

对于 HTTP 请求来说，首字母大写只是一种较为推荐的书写方式，但因为它并不对大小写敏感，所以有时您也会看到使用全小写的情况，就像这个样例。出于一致性考虑，我们还是更推荐使用首字母大写的结构（除非特别说明），来避免在不同应用间传递时因可能的处理方法实现不完全导致错误丢失数据的情况出现。

HTTP 中定义了一些基本的请求头名称（键），但对于想要自行扩展的用法来说，自行补充需要的定义即可。这里我们简单讲几个有代表性的。

- 在传统的 HTTP 认证方式中，通常会使用 `Cookie` 来存储会话标识，从而维持客户端在服务端的身份，例如登录网站之后的用户层操作；但随着前端技术的逐渐发展，不少执行被转移到客户端来进行，尤其是在前后端分离场景下 Cookie 的一些限制让它不再易用，因而使用 localStorage 或 sessionStorage 来存储会话令牌、使用 `Authorization` 请求头来在请求中指定认证信息的操作也逐渐出现。

- 您可能在之前听说过 `User-Agent` 这一项，可以看到在现在这个样例中它是长长的一串，充满了各个浏览器之间兼容性差异的历史遗留泪水。它用于标识发出请求的客户端，例如浏览器，或是 curl wget 这样的命令行工具，或是任何其他自定义使用的值。

- 对于含有请求体的请求来说，它们会包含一项 `Content-Type` 来标明请求体的结构。对我来说，比较常用的内容类型有两种： `application/json` 用来上传信息， `multipart/form-data` 用来上传文件。在一些场景中，您也可能会看到 `application/x-www-form-urlencoded` 这样的类型，它可能会出现在一些使用 form 表单的传统三大件项目中；对于现代开发来说，使用 JSON 来封装需要传递的信息会更为方便快捷。

- 您可能会听说过一些关于 `Referer` 的趣闻。是的，它是一个谬拼，正确的写法应该是 referrer ，只是在编写规范文档时拼错了，所以也就一直将错就错使用下来了。它表示的是当前的请求是从哪个请求引申出来的，一个比较常见的用法是用于追踪从不同来源（如搜索引擎、 SNS 平台或是其他来源）的用户访问情况，另一个用法则是对一些媒体资源实例启动防盗链保护——防止未经授权的站点直接引用它们。在一些平台，例如 GitLab 的登录后跳转回登录前页面的逻辑中，有时也能看到它的身影。

- `Host` 也是一个非常有趣的请求头，我们会在之后讲到它。

#### 请求体

请求体，是指请求携带的数据，一般用在较大量数据传递，或是涉及到后端数据变化的场合。例如表单提交、文件上传等，会将涉及到的内容都放置在请求体中，以便后端的接收与处理。

在 HTTP/1.1 的规范中，请求体与请求头之间使用一个空行隔开，并延伸直至整个请求报文结束。

### 获得一个响应

HTTP/1.1 的响应与请求类似，也以报文的格式呈现。第一行是响应行，接下来是响应头，空行之后是响应体。响应头与响应体和请求的类似，就不多讲述了；我们主要来看看响应行。

响应行由 HTTP 版本号、响应状态码（status code）和状态短语（status message）组成，就像这样：

```
HTTP/1.1 200 OK
```

不出意外的话， HTTP 版本号会与发出 HTTP 请求时使用的版本号一致。例如我们使用 HTTP/1.1 发出请求报文，收到使用 HTTP/1.1 封装的响应报文。

响应状态码和对应的状态短语是一个很有趣的东西。例如我们非常常用的 404 来指代不存在的东西，就是使用了 `HTTP 404 Not Found` 这个状态。

一般的状态码定义为三位数，第一个数字用于表示所处的状态大组，大致定义如下：

| 状态码 | 大组含义       |
| ------ | -------------- |
| 1xx    | 继续处理       |
| 2xx    | 没有问题       |
| 3xx    | 重定向跳转     |
| 4xx    | 客户端请求出错 |
| 5xx    | 服务端出错     |

::: tip

如果您想要快速对各种 HTTP 状态码有一个初步印象，可以参考 [http.cat] 这个网站。

[http.cat]: https://http.cat/

:::

### 离散响应与流式传输

您可能已经发现了， HTTP 的响应是离散的，必须由客户端发出一个请求，服务端才能给出一个响应；要抓取新内容的话，就只能定期轮询。有没有什么办法，能让客户端和服务端之间开启一个连续的数据流，让服务端一有新的信息就能及时推送给客户端呢？

这就要提到 WebSocket 这项技术了。它由 HTTP/1.1 的升级机制扩展而来（但并不等同于 HTTP），在客户端与服务器之间建立一条长连接，从而解决上面提到的这个问题。目前主流的浏览器都有实现对 WebSocket 的支持，因此可以直接用浏览器作为客户端连接到目标服务器。

一个比较典型的适用场景，例如即时通讯服务 (IM) 这种对消息的实时性要求较高的场合，就可以使用流式传输作为主要传输方式，使用轮询作为在流式传输不稳定或是因种种原因无法建立时的回落 (fallback) 措施：在条件允许的情况下，一有新消息服务器就会传给客户端，让客户端可以及时快速地立刻响应；在无法建立起长连接的情况下，则使用轮询作为保护，以进一步提升客户端在不同环境下的的健壮性 (robustness) 。

但需要注意的是，建立并维护 WebSocket 连接对于服务器的资源要求相比起 HTTP 请求来说要大上不少。一般不是对实时性需求非常高的场景下，还是可以使用轮询来减轻服务器的负担，避免太高的负载或是性能损失问题。

那么，随着 HTTP/2 和 HTTP/3 的出现， WebSocket 有没有随之升级呢？ HTTP/2 的协议中去掉了对于 Upgrade 请求头的支持，因而从技术角度来讲它只能基于 HTTP/1.1 来建立；但我在搜寻的时候也看到了好像有在 HTTP/2 基础上运行成功的案例，并且看到了 [RFC8441] 的草案，或许在不远的未来，这些都是可以被规范化实现的。

[RFC8441]: https://datatracker.ietf.org/doc/html/rfc8441

### 不同域名共享 IP

如果您部署过网站，您或许会想这个问题：那么多域名都被解析到同一组服务器的 IP 上的话，网页服务器（web server）应该如何区分哪个域名对应哪个网站呢？

对于 HTTP/1.1 来说，这就要提到我们刚刚没有细讲的 `Host` 请求头了。它标注的是 URL 里的 hostname 部分，因而即便是对同样的 IP 和端口，在不同域名的访问时依然会随着域名不同而变化，从而确保对应域名的实例能加载出对应的内容。因此，这也被称为是**虚拟主机**（Virtual Host）。

但需要注意的是，这是属于 HTTP 协议层面的共享优化，并不代表多个不同的网页服务器可以同时绑定到同一个 IP 与端口的组合——那个还是与 TCP 或是 UDP 协议有关的。

### TLS 加密

您可能已经发现了，上面讲的这些内容全都是基于明文来处理的。但明文传输的数据非常不安全，容易被攻击者截获，甚至是被中间人修改。因此，我们可以使用 TLS 来加密这些 HTTP 请求，让它们变成 HTTP Secure：也就是我们经常使用的 https 这个协议 (scheme) 。

目前最新的 TLS 版本是 1.3 ，主流认为是安全的 TLS 版本至少是 1.2 ，它需要使用来自证书机构 (CA) 签名的证书作为传输层的加密凭证。在请求时，客户端和服务端会交换彼此之间带有公钥的证书，并使用公钥对应的加密方法将请求数据加密传输。对于一般客户端来说，使用任何一张证书（包括自行签署的证书）都是可行的；但对于一些安全要求较高的软件内部通讯来说，通常会使用一个公共的 CA 签名，来确保系统内部的数据都是彼此之间可以信任的。而对于一般系统和浏览器来说，为了确保连接是可信的，会有内置一套内置的可信的 CA 根证书列表，要求所有连接的证书都直接或间接由这些机构颁发。

::: tip 证书的适用范围

证书的意义在于授权指定的服务器使用某个（些）特定的域名，因而它只与域名解析相关，不绑定协议，不绑定 IP ，也不绑定端口。

证书也不仅仅能在 HTTPS 加密中使用，任何可以部署 TLS 加密的协议，如 WebSocket 、 SMTP 、 POP3 、 IMAP 等都可以使用证书进行加密，进而提升数据的安全性。

:::

除去一些国际公认的证书颁发机构外，不同地区的设备出于不同地区的限制或需要，会要求安装一些出于内部安全或政府审查等目的而颁发的地方性证书：例如 [哈萨克斯坦政府] 和 [欧盟] 都尝试过通过颁发地方性证书以实现中间人攻击，从而审查用户的数据。

[哈萨克斯坦政府]: https://support.mozilla.org/en-US/kb/certificate-cannot-be-trusted-warning-kazakhstan
[欧盟]: https://www.eff.org/zh-hans/deeplinks/2021/12/eus-digital-identity-framework-endangers-browser-security

因为签发一张可信证书需要中心化 CA 机构的参与，所以传统的证书往往价值不菲。为了降低 HTTPS 的使用门槛，促使安全的互联网普及，出现了一些例如 [Let's Entrypt] 这样可以免费签发证书的好心机构。时至今日，已经有丰富的工具可以用来管理来自不同机构的免费证书，例如我个人比较常用的 [acme.sh] ；甚至在部署简单服务的场合，还可以直接使用内置证书管理机制的网页服务器，例如 [Caddy] 。

[Let's Entrypt]: https://letsencrypt.org/
[acme.sh]: https://github.com/acmesh-official/acme.sh
[Caddy]: https://caddyserver.com/

那么，对于一个既支持 HTTP 又支持 HTTPS 的网站来说，应该如何配置让它尽可能多地使用 TLS 加密呢？

1. 对于一般的网站来说，可以在 HTTP 响应里配置重定向（HTTP 30x）到 HTTPS 的 URL；
2. 为了避免每次访问都需要重定向，可以使用 [HSTS] （HTTP Strict-Transport-Security）响应头来让浏览器记住这个网站的行为，这样当浏览器一次访问过这个网站之后，后续有效期限内的访问请求就都会直接通过 HTTPS 来请求了；
3. 对于一些可能会在 HTTP 阶段就被中间人攻击劫持的网络环境来说，可以在配置好 HSTS 之后将域名加入到 [HSTS Preload] 列表里，让浏览器即时不曾访问过这个网站，也能知道它会使用 HTTPS 请求。

[HSTS]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Strict-Transport-Security
[HSTS Preload]: https://hstspreload.org/

一些根域名，例如 `.dev` 和 `.app` ，它们已经进入了 HSTS Preload 的列表，因而无需再手动添加。

::: warning 难以回头的路

HSTS 一般仅限于生产环境使用，因为它会让浏览器在访问网站时强制使用 HTTPS 来建立连接，尤其是如果加入了 Preload 列表那么基本可以说就告别了使用明文 HTTP 协议访问的可能性。如果您不确定是否会出现还是需要明文访问的情况，那么一般不建议使用 HSTS 相关的配置。

:::

### SNI 泄露与 ECH 草案

使用了 TLS 的请求会将整个请求报文都进行加密，那么对于一个网页服务器来说，应该如何知道哪个域名对应的需要使用哪张证书进行握手呢？

目前主流的解决方法是使用 SNI 作为 TLS 的扩展，在 TLS 握手之前先将 hostname 告知目标服务器，以确保目标服务器能找到对应的证书。为避免不存在的 hostname 回落到默认证书导致证书名泄露，还可以配置服务器让证书名不正确时直接中断握手流程。

但这么做会让 SNI 在连接的时候变成唯一的明文暴露出去，进而被一些含有恶意功能的网关记录，被用于广告投放甚至是政治迫害等用途。有没有什么办法能进一步提升安全性呢？

曾经有一个 ESNI 草案，但因实现上存在一些困难，目前它已经被 [ECH 草案] 替代。 ECH 的全称是 Encrypted Client Hello ，即意在将整个 Client Hello 段都进行加密，以尽可能减少明文阶段泄露的信息。

[ECH 草案]: https://datatracker.ietf.org/doc/html/draft-ietf-tls-esni-18

## 浏览器能做的事

在前端开发的流程中，利用 JavaScript 的帮助，我们可以更加灵活地使用浏览器发出 HTTP(S) 请求，而无需太过关注其背后的实现细节。

### 创建一个 HTTP 请求

在古老的时代，我们使用 XHR  (XMLHttpRequest)  来完成基于 JavaScript 的请求。它的优势是兼容性非常强大，基本上是个浏览器就支持它，因而在一些需要特殊奇怪老产品兼容性支持的场合，依然可以使用。

而到了今天，主流的浏览器已经能使用 [fetch API] 这个非常现代化的请求工具。它提供了一个比 XHR 更方便使用的封装，并使用了 Promise 封装异步函数机制来优化相关的处理流程。具体的使用可以参考 [使用 Fetch] 这个页面上提供的资料，我们这里趁机稍微来展开讲一讲异步函数是什么东西。

[fetch API]: https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API
[使用 Fetch]: https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch

### 异步函数与同步函数

::: danger 未知的领域

这块的内容我也不是很熟悉，如果有任何错误还请您能帮忙斧正，非常感谢 :pray:

:::

在 Day 1 中我们说过，程序的执行是从上至下的；在 Day 2 中我们也提到过， JS 只有一条主线程，所有的事情都在它上面执行，耗时的操作会阻塞住交互让页面变得卡顿。异步函数的理念正是为了解决这一问题而出现。要想理解它，我们就要稍微关注一下 JS 底层的执行机制了。

JavaScript 的核心执行模式是 **事件循环（Event Loop）**，即在一个大的无限循环中不断地等待队列中出现事件，再依次去执行它们。

::: tip 队列

队列 (queue) 是一种先进先出（FIFO, First In First Out）的数据结构：可以理解为一个两端开口的管道，在管道的一端按照顺序塞入直径等于管道内径的光滑理想球体，它们在管道的另一端一定会遵循塞入的顺序依次退出。

如果是后进先出（LIFO, Last In First Out）的数据模型，那是栈 (stack) ：可以理解为一个单端开口的管道，球体只能从这个口进入与退出。

:::

异步函数与同步函数不同的一个地方在于，同步函数可以确定在执行完成后返回，但异步函数不能知道确切的返回时间。所以与同步函数的返回值设计不同的是，异步函数会使用一种叫做 **回调 (callback)** 的设计，在异步函数中传入一个后续的处理函数，在异步函数执行完成后由它来调用这个回调函数，从而实现后续的处理流程。

一个异步函数的大致执行流程如下：

- 在一个异步任务初始化时，它的回调函数会被放入任务队列的末端，等待异步函数的执行结果返回；
- 当它之前的任务队列都执行完成，运行环境在检查它时发现还未满足它的回调条件，它会被再塞回队列末尾等待下一轮检测；
- 以此循环直至执行完成后，当执行线程再一次检查到这个任务时，触发它放在任务队列中的回调函数。

因此，我们得到了一种用于解决部分耗时太长的操作的新思路：使用异步函数来封装它。

在使用 Promise 的异步封装出现之前， JS 的异步函数需要基于 events 来编写，在每一层异步函数调用中将下一层处理函数作为回调函数参数传入。这样编写有一个结构型的问题，即当需要大量连续的异步函数处理时，层层嵌套的回调函数会非常影响代码的可读性。 Promise 可以理解为一种异步函数的封装语法糖，它本身并不创造新的概念，而是一种作为异步函数封装的辅助工具来解决回调地狱的可读性糟糕的问题。它可以将层层包裹的异步调用展平成类似链式的结构，就像这样：

::: code-group

```js [回调地狱写法]
setTimeout(() => {
    console.log("1");
    setTimeout(() => {
        console.log("2");
        setTimeout(() => {
            console.log("3");
            setTimeout(() => {
                console.log("4");
                setTimeout(() => {
                    console.log("5");
                    setTimeout(() => {
                        console.log("6");
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}, 1000);

console.log("fin");
```

```js [Promise 封装写法]
const mySetTimeout = (time) => new Promise((resolve) => {
    setTimeout(resolve, time);
});

mySetTimeout(1000).then(() => {
    console.log("1");
    return mySetTimeout(1000);
}).then(() => {
    console.log("2");
    return mySetTimeout(1000);
}).then(() => {
    console.log("3");
    return mySetTimeout(1000);
}).then(() => {
    console.log("4");
    return mySetTimeout(1000);
}).then(() => {
    console.log("5");
    return mySetTimeout(1000);
}).then(() => {
    console.log("6");
})

console.log("fin");
```
:::

::: tip 猜猜1

猜猜 `fin` 会在什么时候出现，数字出现之前还是之后？

:::

使用这种写法还有一个好处，就是可以在外面整体处理错误。比如这样：

```js {26-28}
const mySetTimeout = (time) => new Promise((resolve, reject) => {
    if (time !== 1000) {
        setTimeout(() => reject(new Error("时间差不多咯")), time);
    } else {
        setTimeout(resolve, time);
    }
});

mySetTimeout(1000).then(() => {
    console.log("1");
    return mySetTimeout(1000);
}).then(() => {
    console.log("2");
    return mySetTimeout(1000);
}).then(() => {
    console.log("3");
    return mySetTimeout(500);
}).then(() => {
    console.log("4");
    return mySetTimeout(1000);
}).then(() => {
    console.log("5");
    return mySetTimeout(1000);
}).then(() => {
    console.log("6");
}).catch((err) => {
    console.log(err.message);
})

console.log("fin");
```

ES6 引入了新的 `async` 和 `await` 语法糖，则能更进一步地优化 Promise 的使用。配合 try catch 捕获错误，我们的程序可以变成这样：

```js {9-24}
const mySetTimeout = (time) => new Promise((resolve, reject) => {
    if (time !== 1000) {
        setTimeout(() => reject(new Error("时间差不多咯")), time);
    } else {
        setTimeout(resolve, time);
    }
});

try {
    await mySetTimeout(1000);
    console.log("1");
    await mySetTimeout(1000);
    console.log("2");
    await mySetTimeout(1000);
    console.log("3");
    await mySetTimeout(500);
    console.log("4");
    await mySetTimeout(1000);
    console.log("5");
    await mySetTimeout(1000);
    console.log("6");
} catch (err) {
    console.log(err.message);
}

console.log("fin");
```

可以看到已经基本和同步函数的写法差不多了——事实上如果您在浏览器执行它的话，会发现它确实会阻塞进程（ Node.js 环境里不能将 await 放置在顶层）。为了避免这个问题，我们可以这样稍微调整一下代码：

```js {9,26}
const mySetTimeout = (time) => new Promise((resolve, reject) => {
    if (time !== 1000) {
        setTimeout(() => reject(new Error("时间差不多咯")), time);
    } else {
        setTimeout(resolve, time);
    }
});

(async () => {
    try {
        await mySetTimeout(1000);
        console.log("1");
        await mySetTimeout(1000);
        console.log("2");
        await mySetTimeout(1000);
        console.log("3");
        await mySetTimeout(500);
        console.log("4");
        await mySetTimeout(1000);
        console.log("5");
        await mySetTimeout(1000);
        console.log("6");
    } catch (err) {
        console.log(err.message);
    }
})();

console.log("fin");
```

## 跨域资源共享 (CORS) 的处理

## 开发调试好帮手

### OpenAPI 规范

### 请求测试工具

## 主流的设计思路

### RESTful API

### GraphQL

## 今日总结

今天主要讲了 HTTP 的一些底层知识，和 JS 的异步函数的一些思考方式与实用技巧。

猜猜1 的答案是：除了那个 await 在顶层的代码是 `fin` 在最后出来的之外，其他的都是在全部输入完成之后就出现的。理由也很简单——虽然这些函数看上去像是同步函数直接写在主线程里面，但实际上它们是异步函数，当 JS 处理异步函数的时候自动将它们扔出了主线程；而输出的这一行是结结实实的同步函数，既然写在主线程里面那么就在主线程里面被执行了。

## 课后挑战
