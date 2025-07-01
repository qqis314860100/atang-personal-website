## 文件系统

### Pages Router

#### 同构组件

在老的 pages router 或者传统 ssr 中,谈论的是同构组件,即同一个组件文件既会在服务器端运行,在 getServerSideProp 之后，被 reactDomServer.renderToString()渲染成 HTML，发送到客户端，在水和之后客户端完全接管页面的交互.同一份代码跑在两个不同的环境.而在 APP router 中将组件严格划分为服务器组件和客户端组件.

### App Router

从 v13.4 开始,官方主推 APP Router，已经是默认的开发方式了.

#### 功能优势

1.服务器组件 RSC
从根本上改变了数据获取和渲染的方式，能显著减少发送到客户端的 JavaScript 体积;

1. 服务器组件 - 默认身份
   · 如何定义:在 app 目录下创建的任何组件文件,默认就是服务器组件.
   · 运行地点:只在服务器上运行.
   · 它的代码会发生什么: 它的 js 代码永远不会被打包发送到浏览器,浏览器只会收到它渲染后的结果(RSC Payload).
   · 能力限制：基于 node 环境,不能使用任何客户端交互相关的方法和事件.

2. 客户端组件
   · 如何定义:在文件第一行明确'use client'命令.
   · 运行地点:主要在客户端(浏览器).(在构建时,也会在服务器上进行一次初始渲染以生成 HTML).
   · 它的代码会发生什么:js 代码会被打包,发送到浏览器,并参与水和和后续的交互.
   · 能力限制: 不可以直接访问服务器端资源,比如数据库或文件系统,它获取数据的方式仍然时传统的.

3. 总结
   App Router 的页面组件树,服务器组件构成整个应用的'骨架和器官',负责搭建结构、处理核心的数据逻辑,是稳固
   的、非交互的部分；客户端组件时附着在骨架上的'肌肉和神经',他们被包裹在服务器组件的骨架之中，负责所有需要
   用户交 互、需要实时响应的'活动'部分.
   2.Streaming 和 Suspense
   提供了更优的用户体验，无需等待整个页面数据加载完.

3.精细的布局结构
通过 layout.js 可以轻松实现持久化、可嵌套的复杂布局,状态在页面切换时不会丢失.

4.更强大的路由功能
如路由组 (group)、并行路由 @parallel、拦截路由 (.)(...) 等

- 动态路由 路由的名字会作为 params prop 传给布局、页面、路由处理程序以及 generateMetadata 函数

```
动态路由:
Pages Router: pages/posts/[id].js
App Router: app/posts/[id]/page.js

API路由:
Pages Router: pages/api/hello.js
App Router: app/api/hello/route.js
```

- [folderName]
- [...folderName] params:{a:{b:{c}}} -> a/b/c 路径完全匹配
- [[...folderName]] 路径可选
- (folderName) 路由组，不影响 URL
- 平行路由 可以理解为 vue 的插槽,有独立的导航和状态管理,1.条件渲染 2.为每个路由定义独立的错误处理和加载界面 3.子导航(@folderName 不影响 URL)

  - @folderName 平行路由
  - default.js 为不匹配的插槽呈现 default.js 中定义的内容,如果没有再 404

- 拦截路由 在当前路由拦截其他路由地址并在当前路由中展示目标地址的内容。作用希望用户继续停留在重要的页面上,比如新闻列表点击某跳新闻不跳转详情而是留在列表 modal 展示,而直接访问详情 url 则可以进入.

  - (.) 表示匹配同一层级、(..) 表示匹配上一层级、(..)(..) 表示匹配上上层级、(...) 表示匹配根目录.匹配的是路由层级而不是文件夹层级，路由组、平行路由不做计算.

- 路由处理程序

  - 路由处理程序是使用 web request 和 response 对给定的路由自定义处理逻辑的.
  - 客户端与服务端通过 API 接口来交互，这个 API 接口在 nextjs 就叫做路由处理程序.定义:app->[folderName]->route.js,通过文件路径访问请求.
    ** 在服务端组件和只有 get 方法的路由处理程序中使用 fetch,返回结果会自动缓存 **
  - get 在 v14.0 请求会被缓存,退出缓存:1.读取 request 对象;2.添加其他 HTTP 方法(比如 POST 往往用于修改数据,GET 是请求数据);3.使用 cookies、headers 这样的动态函数;4.路由段配置声明为动态渲染模式`export const dynamic = 'force-dynamic'`;
  - 重新验证设置缓存失效`export const revalidate = 10`,在 10s 内持续访问返回的都是前面的缓存结果.

- 中间件 middleware

· 是什么:中间件是在请求完成之前运行的代码,可以拦截并控制应用里的所有请求和响应,比如可以基于传入的请求，重写、重定向、修改请求或响应头，甚至直接响应内容
· 在哪里运行:默认在 edge runtime,也可以配置 nodejs runtime;
· 场景:身份验证、重定向、a/b 测试、修改请求头.

- 定义 [root folder] -> middleware.js
- 设置匹配路径方法：
  1.matcher 配置项,可以设置正则`['regexp path']`底层利用 path-to-regexp 解析地址

  ```
  export const config = {
     matcher: ['/about/:path*', '/dashboard/:path*'],
  }
  ```

  2.条件语句，在方法里写逻辑.

  ```
  export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/about')) {
    return NextResponse.rewrite(new URL('/about-2', request.url))
  }
  ```

  3.中间件配置
  skipTrailingSlashRedirect 跳过尾部斜杠重定向
  skipMiddlewareUrlNormalize 跳过中间件格式化 URL

- 路由响应执行顺序

在 next 中，很多地方可设置路由的响应,比如 next.config.js、中间件、具体的路由中都可以设置.所以要注意它们的执行顺序:

```mermaid
graph LR;
headers/config ---> redirects/config ---> 中间件的rewrites,redirects等 ---> beforeFiles/config-rewrites ---> 基于文件系统的路由 ---> afterFiles/config-rewrites ---> 动态路由 ---> fallback/config-rewrites
```

- CSRF(cross sit request forgy)跨站资源伪造

定义:利用你已登录的身份,通过伪造你去发送恶意请求,当用户在 a 网站验证登录后浏览器存储 cookie,此时在 a 网站未退出时浏览 b 恶意网站,b 网站伪造 img、iframe、script 等标签请求 a 网站,此时浏览器默认在请求头中携带上了 a 网站的 cookie,然后 a 网站就被骗了于是执行了恶意请求的操作(如修改密码、发帖、删除数据等).

- 防范措施:
  · 1.校验 token(最传统可靠),token 在浏览器中是根据域名存储的,那么在 b 网站自然拿不到 a 网站的 storage.
  · 2.samesit cookie:浏览器新特性为 cookie 设置 strict 属性,完全禁止三方网站发起请求时携带 cookie;lax(适中，目前大多数浏览器的默认值),允许用户通过常规链接(如 a 标签跳转)等导航方式从外部网站进入携带 cookie,但会阻止像 img、表单提交等方式发起跨站请求携带 cookie,这已经能防御绝大多数攻击.
  · 3.验证 referer/origin 请求头,但是这个值会被篡改，且在某些情况下(如 https 跳转到 http)浏览器可能不发送 referer,所以只能作为辅助防御手段.

## next 的渲染模式

传统意义的 SSR(PHP,JSP),每一次请求都重新在服务器上渲染一次 HTML,访问量大的情况下高并发会把服务器压垮.NEXTJS 提供多种策略来避免这个瓶颈,而不是无脑对所有页面都 SSR.优化的核心思想是:尽可能把计算迁移，能不做实时计算就不做！

### SSG 静态站点生成

```
Pages Router: export async function getStaticProps() { ... }
App Router: 这是默认行为，直接在服务器组件里 fetch 数据即可。
```

· 实现:在 APP router 中,SSG 是默认行为,只要不使用任何动态函数或动态数据获取,项目在构建时预先生成所有静态页面的 HTML,用户请求时,服务器不做任何计算,直接将线程的静态 HTML 秒速返回；
· 适用>博客文章、产品介绍页、公司官网等；
· 特点>性能等同于纯静态网站，可以承受极高的并发，因为没有实时计算;

### ISR Incremental Static Regeneration 增量静态再生

```
Pages Router: getStaticProps 返回 revalidate: N。
App Router: fetch(..., { next: { revalidate: N } })。
```

· 实现:在 app router 中通过 fetch 的 next.revalidate:n 选项控制,
· ISR 是对 SSG 的补充加强,解决“静态页面内容不会更新”.可以给页面加`revalidate`时间,在指定时间内访问会返回旧页面,超出时间会在后台触发一次重新生成,然后替换掉旧的,之后再看就是新内容,直到下个周期.
· 适用>新闻网站、电商商品列表页、社交媒体信息流等需要保持数据相对新鲜又能接受少量延迟的页面.
· 特点>兼具静态页面的高性能和动态内容的更新能力，极大缓解了服务器压力.

### SSR

```
Pages Router: export async function getServerSideProps() { ... }
App Router: fetch(..., { cache: 'no-store' }) 或使用动态函数 cookies()。
```

** 为了让 next 具有自动处理缓存和渲染模式,必须使用它扩展过的 fetch. **

#### APP Router

##### 使用未缓存的数据请求 uncached data request

在 next 中,fetch 请求的结果默认会被缓存,可以设置退出缓存，一旦设置退出缓存,就意味"使用未缓存的数据请求",会导致路由进入动态渲染也就是 SSR.

· 实现:通过使用动态函数或选择动态数据获取来“选择加入”SSR 模式.

- 动态数据获取
  · fetch(url, { cache: 'no-store' }): 如上所述，完全不使用缓存，每次都重新请求;
  · fetch(url, { next: { revalidate: 0 } }): 这个选项的效果与 cache: 'no-store' 类似;
- 动态函数
  · next/server 导入的 cookies、headers 函数
- 动态参数
  · 获取 searchParams,页面组件中可以直接获取到这个 props,包含了 URL 的查询参数,因为查询参数是每个请求都可能变化的,所以任何读取 searchParams 的页面也必须是动态渲染的.
- 手动声明
  · `export const dynamic = 'force-dynamic';`

#### Pages Router

. 在 pages router 中在页面导出 getServerSideProps 函数.

流程:

```mermaid
1.用户请求页面A:浏览器发送一个GET到服务器.
2.服务器处理:
  - 这是一个全新、独立的请求。服务器会运行getServerSideProps,获取数据.
  - 通过props传递给每个组件,然后将数据和组件渲染成一个全新的HTML字符串.
3.客户端处理:
  - 接受HTML后渲染,但是这时候还没有交互能力需要等待Javascript下载完成.
  - JS文件下载完成,开始和HTML进行事件绑定等操作,这个阶段称为水和.
  - react(在客户端)不会丢弃服务器已经渲染好的HTML然后重新渲染一遍。相反,它做了一件非常聪明的事:
    · react 也会在内存中构建出这个组件的VDOM.
    · 然后,react拿着VDOM和浏览器中已经存在由ssr生成的真实dom去进行“比对和匹配”.
    · 它会遍历整个虚拟dom树,匹配成功的话,将真实DOM节点的引用赋值给当前fiber节点的stateNode属性.并同时挂载事件。
    · 当整棵树都遍历完毕,水和阶段就完成了,此时React已经完全接管了这棵真实DOM树,此时HTML的内容才变为可交互.
```

· 缺点:1.SSR 的数据获取必须在组件渲染之前;2.组件的 JS 必须先加载到客户端才会开始水和;3.所有组件必须水和后才能开始交互；4.此外 SSR 只用于页面的初始化加载,对后续的交互、页面更新、数据更改,ssr 并无作用 5.SSR 的本质是 http 的无状态特性,每个请求都是独立的，服务器不负责记住请求之间的交互状态.

· 适用>个人中心、银行账户余额页面、后台管理系统仪表盘、金融相关的.

· 在 nextjs 中当页面由 getServerSideProps 时就会切换到 SSR 模式.没有 getServerSideProps 则会预渲染成静态的 HTML.

### RSC React Server Component

概念:服务器组件是一种全新的组件范式,它将渲染的地点固定在服务器上.默认情况下,它以一种类似 SSG 的方式在构建时在生成静态产物,但它也具备了在运行时根据需要动态地、按需地重新渲染的能力，这是传统页面级别 SSG/SSR 所不具备的灵活性.

RSC 和 SSR 区别:

1.相对 SSR,RSC 提供了更颗粒度的组件渲染方式,一个页面由多个组件构成,其中一些事服务器组件(在服务器运行,不产生前端 JS),一些是客户端组件.应用依赖的服务端组件不会打包到 bundle 中,而 SSR 需要将组件的所有依赖打包到 bundle 中,大大减少了应用的体积，并且服务器组件可以被独立缓存,进一步提升了性能.

2.最大的区别,SSR 是在服务端将组件渲染成 HTML 发送给客户端,而 RSC 是将组件渲染成一种特殊的格式,称之为 RSC Payload.RSC Payload 的渲染是在服务端,但不会一开始就返回给客户端,而是在客户端请求相关组件的时候才会返回给客户端,RSC Payload 会将组件的数据和样式组装好,客户端收到 RSC Payload 后回重建 React 树,修改页面 DOM.相较于每次 SSR 都是一个新的 HTML 页面`(讲的是单纯 SSR，两次 SSR 状态无法维持,一般做法是 SSR 初次渲染,然后 CSR 更新，这种情况状态可以保持.)`,RSC 可以多次重新获取,不会丢失客户端状态而是实现了局部更新.

** 在 next 中所有的组件都是服务端组件,除非声明了`use client`，或者被导入到了`use client`模块中。此时它们会被视为客户端组件,意味着它的代码要被打包到客户端 bundle 中 **

#### RSC Payload

##### 1. 什么是 RSC Payload?

一种紧凑的、类似 JSON 的流式格式.可以把他想象成一系列的‘指令’和‘数据块’.它通常包含以下几种信息:

1. 渲染静态内容(序列化的虚拟 dom Serialized Virtual DOM)
   · 对于那些纯粹的、没有交互的 HTML 元素,payload 会生成序列化后的 VDOM 结构,next 从根本上就不允许服务器组件处理交互事件.
   · 它看起来可能像这样（简化后）：["div", { "className": "container" }, ["h1", {}, "Hello, World!"]]。这比完整的 HTML 标签 <div class="container">...</div> 要紧凑得多。
2. 客户端组件的占位符
   · 服务器组件渲染到一个客户端组件时,RSC Payload 不会包含而是留下一个占位符,占位符包含两个关键信息:
   · 客户端组件的标识符,通常是它的 JS 文件路径.
   · 传递给该组件的 props.
3. 传递给客户端组件的 props 数据
   · 所有从服务器组件传递给客户端组件的 props 都必须是可序列化的(不可能是函数、class 示例等).这些 props 会包含在 payload 中.
4. suspense 边界信息
   · 如果使用 suspense,payload 会包含 suspense 边界的标记,以及在数据加载完成前后需要渲染的不同内容,作用流式渲染和选择性水和.

##### 2. RSC Payload 流程

1. 服务器:
   · 服务器运行服务器组件.
   · 遇到静态内容,就将其序列化成 vdom 结构放进 payload.
   · 遇到客户端组件,就在 payload 放一个“占位符”,包含组件的引用和 props.
   · 将这个 payload 流式传输到客户端.
2. 客户端
   · 客户端的 react 接受到这个 RSC payload 流.
   · react 会逐块解析 payload:

   ```
    · 看到序列化的 vdom,就直接在页面创建或更新对应的真实 dom 节点.这个过程非常块,因为它不需要执行任何组件的渲染逻辑，只是拼装预先计算好的结果.
    · 看到客户端组件的占位符,react 会检查这个组件的 JS 代码是否以及下载:
      · 如果没下载,会懒加载对应的 js 文件.
      · js 加载并执行后,react 就会在客户端正常的渲染这个组件,并将 payload 中携带的 props 传递给它.
   ```

### CSR

实现: 在客户端组件声明"use client",结合 useEffect 和 useState.

浏览器请求 HTML 来获取 JavaScript，CSS 文件,渲染过程完全由浏览器来完成的.
优点:服务器压力小并且一旦应用加载完成,页面之间切换流畅,前后端分离清晰根据约定的 API 接口各司其职.
缺点:首屏加载慢,SEO 不友好,对设备性能由要求(渲染完全由用户设备承担).
适用>各种后台管理系统、复杂的在线工具(如 figma)、web 邮箱、需要登录才能使用的社交应用内部.

## Streaming SSR 流式渲染

利用 React.Suspense 或者配置 loading.js 和流式分布传输技术,将原本只能先获取数据,再渲染后水和的 SSR 流程改为渐进式的渲染和水和.`但是这里对于JS代码的减少和水和必须在客户端的问题还是存在.`

### 流式分块传输 Transfer-Encoding:chunked HTTP/1.1

传统 HTTP 响应必须直到完整的响应内容大小`Content-Length`,然后才能把整个响应一次发给浏览器,而流式分块传输服务器不需要预先知道响应的大小,可以将内容分割成一个个独立的“chunk”,每准备好一块就发一块.

#### 技术细节:

```
1.服务器发送响应时,HTTP响应头时`Transfer-Encoding:chunked`而不是`Content-Length`.
2.每个chunk前面会有一个16进制的数字,表示整个chunk的大小.
3.浏览器接受到一个chunk就处理一个.
4.最后,服务器会发送一个大小为0的chunk,表示响应结束了.
```

### Suspense

作用:
· 1.允许声明式地指定一个加载状态,用于当其子组件树中的某些部分尚未准备好时或者正在等待一个异步操作完成("悬停")进行展示.
· 2.另外,在 react 并发模式下,suspense 将应用从一个巨大的、不可分割的整体,变成了一系列可以独立加载、独立渲染、独立水和的“岛屿”.

#### 什么情况会悬停?

1.在 react 中,一个通过 React.lazy()进行代码分割的组件,在它的 JS 代码块下载完成前“悬停”. 2.一个正在使用 use(promise)或其它与 suspense 集成的数据获取库来请求数据的组件,在返回前,会悬停.

#### Suspense 怎么根据用户决定水和的优先级?

```
场景：
服务器流式地发送来了 <Sidebar> 和 <MainContent> 的 HTML。
React 的默认计划是先水合 <Sidebar>，然后再水合 <MainContent>。
用户交互发生：
就在 React 准备开始水合 <Sidebar> 时，用户点击了 <MainContent> 里面的一个按钮。
```

答:Suspense 本身只是一个"边界"声明器,它自己并不直接控制优先级。真正的优先级控制是 React 的并发调度器来完成的,而 Suspense 为整个调度器提供了"工作单元"和"时机".它的整个处理流程时这样的:

1. Suspense：将应用分割成可独立处理的“岛屿”.
2. 事件捕获：React 如何“知道”用户交互?
   答案: 事件委托和事件重放
   · 1.在顶层附加监听器:在应用启动时,react 不是将监听器一个个加到 DOM 上，而是在文档的根节点(document)附加了所有类型事件的统一监听器.
   · 2.事件冒泡与捕获:当用户点击页面任何元素时,这个点击事件会向上冒泡,最终被 document 的根节点器捕获到.
   · 3.记录事件信息: React 的根监听器会记录下这个事件的详细信息,包括:时间类型、DOM 元素、发生时间.
3. 并发调度器:智能决策与优先级调整.
   调度器开始工作，调度器的决策流程:
   · 1.捕获与识别:根监听器捕获到 Click 事件,react 检查目标元素,发现它位于尚未水和的 <MainContent> 组件内部.
   · 2.提升优先级:调度器收到高优先级的用户事件,立即暂停或放弃即将开始的<Sidebar> 水合任务,创建一个新高优先级的任务.
   · 3.执行高优先级任务:调度器会优先执行 <MainContent> 的水合。相关的 JS 代码会被执行,事件处理器会被附加到真实的 DOM 元素上.
   · 4.事件重放:一旦水和完成,调度器会检查之前记录下来的那个“待处理”的点击事件.它会重新派发(replay)这个事件，这一次因为<MainContent>里的按钮已经有了正确的点击方法,所以事件被正确执行,用户的交互得到了响应.
   · 5.恢复低优先级任务:在完成了高优先级任务后,浏览器再次进入空闲状态,调度器会回过头来继续执行之前被暂停的低优先级任务--水和<Slidebar>

### 总结

Transfer-Encoding: chunked 是后端技术，react.suspense 是前端技术，当两者结合时,就实现了 Streaming SSR.服务器利用 Suspense 来识别页面的“慢”部分,并利用 chunked 编码,将页面的“快”部分和加载状态先发送出去,让用户可以更快地看到并与页面交互，从而极大地提升了真实和感知的用户体验.

## NextJS 的双重产物:HTML+JSON

在 npm run build 后,next 会生成两个核心产物,ISR 模式下,revalidate 到期后服务器会在后台重新生成 HTML 和 JSON:

1. 一个 HTML 文件
   · 这个文件包含了完整的、可以直接被浏览器渲染的 HTML 结构;
   · 它的作用用于首次加载,当用户通过 URL 访问页面时,服务器会直接发送这个 HTML,实现最快的首屏速度和最好的 SEO.
2. 一个 JSON 文件
   · 这个文件包含了 getStaticProps 函数返回的 props 对象内容.
   · 作用:用户客户端导航和客户端数据更新.当客户端导航时 next 会去请求小得多 JSON 文件的数据,然后重新渲染视图.当使用请求库的时候可以设置个时间来对 JSON 文件定时获取,更新视图.

## 缓存机制

Next.js 的高性能很大程度上归功于其智能且分层的缓存策略。它不是单一的缓存，而是一个协同工作的系统。理解这个系统是精通 App Router 的关键。
缓存机制主要由 **四层** 构成，从客户端到服务端，覆盖了从请求到数据获取的整个生命周期

### 四层缓存

1. Router Cache(客户端路由器缓存)

这是位于**浏览器内存中**,最接近用户的缓存

- **作用**: 存储已访问过的路由的 RSC Payload（React 服务器组件的渲染输出）。当你通过 `<Link>` 组件在页面间跳转时，Next.js 会优先从这个缓存中加载目标页面，实现极速的、无需请求服务器的客户端导航。
- **生命周期**: 仅限用户的单次会话。当用户硬刷新页面时，此缓存被清空。
- **关键点**:
  - 这是 `<Link>` 组件实现"秒开"体验的核心。
  - Next.js 会自动**预取 (Prefetch)** 视口内 `<Link>` 指向的路由，提前填充此缓存。
  - 可以通过 `router.refresh()` 手动让此缓存失效并发起新的服务器请求。

2. Full Route Cache (服务端全路由缓存)

这是服务器端的**默认缓存**，它缓存静态路由的完整渲染结果。

- **作用**: 缓存页面的 HTML 和 RSC Payload。这使得静态生成 (SSG) 成为可能。对于一个静态页面，第一次构建后，其渲染结果就被存在这一层。后续所有对该页面的请求都会直接命中此缓存，服务器无需重新渲染。
- **生命周期**: 持久化。直到被手动或按时重新验证 (revalidate) 才会失效。
- **如何失效**:
  - **基于时间**: 在页面或布局中设置 `export const revalidate = N;` (N 为秒数)。
  - **按需**: 调用 `revalidatePath('/your-path')` 或 `revalidateTag('your-tag')`。

3. Data Cache (服务端数据缓存)

这是我们之前重点讨论过的、由 Next.js 扩展的 `fetch` API 提供的持久化数据缓存。

- **作用**: 缓存来自外部数据源（如第三方 API、数据库）的响应。这个缓存是跨请求、跨路由共享的。例如，如果两个不同的页面都 `fetch` 同一个用户数据 API，它们可以共享同一份数据缓存。
- **生命周期**: 持久化。默认情况下，`fetch` 的结果会被永远缓存，除非显式设置了重新验证策略。
- **如何控制**:
  - **在 `fetch` 中**:
    - `fetch(url, { next: { revalidate: N } })`: 设置该条数据的 ISR 有效期。
    - `fetch(url, { cache: 'no-store' })`: 完全不使用数据缓存，每次都重新请求。
    - `fetch(url, { next: { tags: ['...'] } })`: 为数据打上标签，便于按需批量失效。
  - **按需**: `revalidatePath` 和 `revalidateTag` 同样可以使相关的数据缓存失效。

4. Request Memoization (请求内函数记忆化)

这是生命周期最短的一层缓存，由 React 的 `cache` 函数提供（Next.js 的 `fetch` 自动包含了此功能）。

- **作用**: 在**单次**服务器渲染过程中，避免对同一函数的重复调用。想象一个场景：你的根 `layout.js` 和某个页面组件都调用了 `getUser()` 函数来获取当前用户信息。如果没有记忆化，这个函数会被执行两次，造成浪费。
- **生命周期**: 仅限单次服务器请求-渲染周期。请求结束后，此缓存立即被销毁。
- **如何使用**:

  - `fetch` 请求自动享受此优化。
  - 对于非 `fetch` 的函数（如数据库查询），可以用 `import { cache } from 'react'` 包裹起来：

    ```javascript
    import { cache } from 'react'
    import db from './db'
    
    export const getUser = cache(async (id) => {
      return await db.user.findUnique({ where: { id } })
    })
    ```

总结

这四层缓存机制环环相扣：

- **Router Cache** 提供了最快的客户端导航体验。
- **Full Route Cache** 实现了高性能的静态服务，降低了服务器负载。
- **Data Cache** 减少了对外部数据源的重复请求，提升了构建和渲染速度。
- **Request Memoization** 在单次渲染内部优化了函数调用，避免了资源浪费。

### 重新请求验证

在 next 中,服务端组件和只有 get 方法的路由处理程序中使用 fetch,返回结果会自动缓存;清除数据缓存并重新获取最新数据的过程就叫数据验证.

#### 基于时间的重新验证

即经过一定时间后新请求产生重新验证数据,适用于不经常更改且新鲜度不那么重要的数据.
· 1.基于时间的重新验证

- 使用 fetch 时设置 next.revalidate 选项,针对某个 api
  `fetch('https://...', { next: { revalidate: 3600 } })`
- 通过路由段配置项,会重新验证该路由段所有 fetch 请求
  `export const revalidate = 3600`
  ** 在一个静态渲染的路由段中,多个请求设置了不同的时间，将会用最短的时间用于所有的请求。动态渲染的路由段,每个请求都被独立重新验证 **

· 2.按需重新验证

在路由处理程序或 server Action 通过路径(revalidatePath)或缓存标签(revalidateTag)实现

#### 在 react 和 next 中或许数据建议与最佳实践

1. 尽可能在服务端获取数据,好处如下:
   · 可以直接访问后端资源(如数据库)
   · 防止敏感信息泄漏
   · 减少客户端和服务端之间的来回通信,加快响应实践.
2. 在需要的地方就获取数据
   如果组件树中的多个组件使用相同的数据，无须先全局获取，再通过 props 传递，你可以直接在需要的地方使用 fetch 或者 React cache 获取数据，不用担心多次请求造成的性能问题，因为 fetch 请求会自动被记忆化。这也同样适用于布局，毕竟本来父子布局之间也不能传递数据。

3. 适当的时候用 streaming
   Streaming 和 Suspense 都是 React 的功能，允许你增量传输内容以及渐进式渲染 UI 单元。页面可以直接渲染部分内容，剩余获取数据的部分会展示加载态，这也意味着用户不需要等到页面完全加载完才能与其交互。

4. 串行获取数据
   所谓串行数据获取，数据请求相互依赖，形成瀑布结构，这种行为有的时候是必要的，但也会导致加载时间更长。

5. 并行数据请求
   要实现并行请求数据，你可以在使用数据的组件外定义请求，然后在组件内部调用.

6. 预加载数据
   防止出现串行请求的另外一种方式是使用预加载.搭配 React 的 cache 函数一起使用.

## Server Action 服务端操作

· 目标:在服务器上执行逻辑，通常是相应用户交互来进行数据修改、重新验证缓存等.
· 本质:是一个异步函数,这个函数可以在客户端被调用，但其函数体内的代码绝对不会发送到客户端，而是在服务器上安全地执行.

**Server Actions** 是 Next.js App Router 中一项具有变革性的功能。简单来说，它是一种允许你**在服务器上定义、但在客户端上无缝调用**的函数,需要`use server`指令声明,告诉 next 不要把它的函数体代码打包到客户端 JavaScript 里，请为它创建一个安全的、加密的引用.当客户端代码调用这个引用时,请把请求路由回服务器来执行原始的函数代码'。

你可以将 Server Actions 视作一种框架内置的、类型安全的 **RPC (远程过程调用)** 实现。其核心目标是极大简化客户端与服务器之间的数据交互，尤其是**数据变更 (mutations)** 操作，比如提交表单、更新用户信息等。

### 它们解决了什么问题？ (The Old Way vs. The New Way)

在没有 Server Actions 之前，处理一个简单的表单提交通常需要以下繁琐的步骤：

1.  **客户端**: 创建一个 `onSubmit` 函数，阻止表单默认提交事件。
2.  **客户端**: 管理 `loading`, `error`, `success` 等状态。
3.  **客户端**: 使用 `fetch` 将表单数据 `POST` 到一个 API 端点。
4.  **服务端**: 创建一个专门的 API 路由 (e.g., `/api/add-item`) 来接收请求。
5.  **服务端**: 在 API 路由中编写验证、数据库操作等逻辑。
6.  **服务端**: 返回 JSON 响应。
7.  **客户端**: 处理服务端返回的 JSON，更新 UI 状态。
8.  **客户端**: 手动触发数据重新获取，以刷新页面上的相关数据。

这个流程将一个简单的功能割裂在了多个文件和多个逻辑层中。

而有了 Server Actions，这个流程被极大地简化了。

### Server Actions 的核心特性与优势

#### 1. 无需手动创建 API 路由

你可以直接将后端逻辑封装在一个函数里，并用 `'use server'` 指令标记它。

**示例：** 在一个服务器组件 (`page.js`) 中定义并使用一个 Server Action。

```jsx
// app/page.js (Server Component)
import { revalidatePath } from 'next/cache'
import db from './lib/db' // 假设这是你的数据库实例
import ItemsList from './items-list'

export default async function Home() {
  const items = await db.item.findMany()

  // 1. 直接在这里定义一个异步函数
  async function addItem(formData) {
    'use server' // 2. 将它标记为 Server Action

    const name = formData.get('name')
    if (typeof name !== 'string' || !name) return

    // 3. 直接在这里执行服务器端操作 (e.g., 数据库写入)
    await db.item.create({ data: { name } })

    // 4. 内置的数据重新验证，自动刷新UI
    revalidatePath('/')
  }

  return (
    <main>
      {/* 5. 将 action 函数直接传递给 form */}
      <form action={addItem}>
        <input type="text" name="name" />
        <button type="submit">Add Item</button>
      </form>

      <ItemsList items={items} />
    </main>
  )
}


'use server' 的作用可以概括为：
1.安全边界：它明确地标记了哪些服务端函数是可以从客户端被调用的，防止意外暴露其他服务端代码。
2.创建 RPC 调用：它创建了一个远程过程调用（RPC）的机制。客户端得到的不再是函数本身，而是一个“代理存根”（proxy stub），调用这个存根就会触发一个到服务器的网络请求。
3.序列化：它负责自动处理从客户端传递到服务端的参数的序列化，以及从服务端返回结果的反序列化。
```

#### 2. 关注点共置 (Co-location)

如上例所示，数据读取 (`findMany`)、数据写入 (`create`) 和使用这些数据的 UI (`<form>`) 都被放在了同一个文件里。这使得代码的逻辑更加内聚，易于理解和维护。

#### 3. 渐进增强

当 Server Action 被传递给 `<form>` 的 `action` 属性时，它天然支持渐进增强。即使在客户端 JavaScript 加载失败或被禁用的情况下，表单依然可以作为标准 HTML 表单工作，实现完整的页面刷新提交。

#### 4. 简化的状态管理

Next.js 提供了配套的 Hooks 来处理表单交互，让客户端的开发体验也变得非常简单。

- `useFormStatus`: 用于在提交表单时显示待处理状态。
- `useFormState`: 用于根据 form action 的结果更新表单状态。

**示例：** 将提交按钮抽象成一个客户端组件。

```jsx
// app/submit-button.js
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}
```

### 结论

Server Actions 并非要取代所有的 API 路由（例如，对于需要被第三方服务调用的 webhook，API 路由依然是最佳选择），但它为 Web 应用内部的客户端-服务器交互提供了一种更简单、更高效、更内聚的模式。

它通过将数据变更逻辑无缝集成到 React 组件模型中，进一步兑现了 Next.js（作为全栈框架）的承诺，极大地提升了开发效率。

## 样式

### CSS-In-JS

```Javascript
// styled-jsx
// 这是一个特殊的 Next.js Hook，它的回调函数只会在服务器上运行
useServerInsertedHTML(() => {
  // 第 1 步：收集样式
  // jsxStyleRegistry 是一个在服务器上运行的“样式注册表”或“收集桶”。
  // 在服务器渲染你的组件时，所有动态生成的 CSS 规则都被放进了这个桶里。
  // .styles() 方法就是把桶里所有的样式（通常是 <style>...</style> 标签）一次性取出来。
  const styles = jsxStyleRegistry.styles()

  // 第 2 步：清空收集桶
  // 这一步至关重要。服务器环境可能会被多个用户请求复用。
  // .flush() 会立即清空这个注册表，防止 A 用户的样式“泄露”到 B 用户的渲染结果中。
  // 确保每个请求的样式收集都是从一个干净的状态开始。
  jsxStyleRegistry.flush()

  // 第 3 步：返回（注入）样式
  // 这个 return 语句会把刚才取出的 styles (那些 <style> 标签) 交给 Next.js。
  // Next.js 会确保在最终的 HTML 响应中，将这些样式精确地插入到 <head> 标签的末尾。
  return <>{styles}</>
})

// styled-component
'use client'
// lib/registry.js
import React, { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

export default function StyledComponentsRegistry({ children }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') return <>{children}</>

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  )
}

// layout.js
import StyledJsxRegistry from './registry'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
      </body>
    </html>
  )
}

```

### Sass

```Javascript
使用 next.config.js 的 sassOptions选项配置Sass编译器：
// next.config.js
const path = require('path')

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}

// Sass变量
// app/variables.module.scss
$primary-color: #64ff00;

:export {
  primaryColor: $primary-color;
}

import variables from './variables.module.scss'

export default function Page() {
  return <h1 style={{ color: variables.primaryColor }}>Hello, Next.js!</h1>
}
```

## 配置

### 环境变量

1. 通过`.env.local`文件加载环境变量

```javascript
// .env.local
PASSWORD = 123
USER = TZQ
ALIAS = TOM$USER //可以通过 $ 引用变量
// 就可以通过服务端组件或路由处理程序通过Process.env获取

// 环境变量加载顺序: 1.process.env -> 2. .env.$(NODE_ENV).local -> 3. enc.local(当NODE_ENV是test不查找) -> 4. .env.$(NODE_ENV) -> .env
```

2. 通过`NEXT_PUBLIC_`前缀在浏览器获取环境变量

### 绝对地址导入和模块路径别名

1. baseUrl: 绝对地址导入. `baseUrl:'.'`从项目根目录中直接导入

```javascript
src/components/button.js -> <Button/>

src/app/page.js -> import Button from '/components/button'
```

2. path:路径别名

```javascript
"paths": {
      "@/components/*": ["components/*"]
}

import Button from '@/components/button'
```

### Metadata 元数据

元数据 简单的来说就是描述数据的数据。







# RSC 与 BFF：作用相似，但并非同一事物

这是一个非常深刻的问题，触及了现代全栈框架演进的核心。简单来说：**Next.js RSC 在功能和作用上很大程度可以取代传统的 BFF，但它们的实现方式和设计哲学完全不同。**

你可以认为 RSC 是实现 BFF 目标的一种更现代、与前端框架更深度集成的方式。

---

## 什么是 BFF (Backend for Frontend)？

BFF 是一种**架构模式**。它是一个位于纯前端（浏览器）和下游微服务/数据库之间的服务器应用。它的核心职责是：

1.  **API 聚合 (Aggregation)**: 调用多个后端服务（比如，用户服务、产品服务、订单服务），并将它们的数据合并成一个前端需要的单一、干净的数据包。
2.  **数据转换 (Transformation)**: 将后端返回的原始数据塑造成前端组件所期望的精确格式，裁剪掉不必要的字段，简化结构。
3.  **安全边界**: 作为前端唯一交互的入口，隐藏下游服务的复杂性，并保护 API 密钥、数据库连接字符串等敏感信息不泄露到浏览器。
4.  **解耦 (Decoupling)**: 让前端团队和后端团队可以独立工作。只要 BFF 提供的 API 接口不变，后端服务的变化就不会影响到前端。

**BFF 的产出物通常是 `JSON` 数据。**

![BFF Diagram](https://user-images.githubusercontent.com/1779921/222162608-59c9b329-109c-42ae-9d62-671a416a9254.png)
_图：传统的 BFF 架构，前端通过一个中间层获取数据_

---

## 什么是 RSC (React Server Components)？

RSC 是一种**组件技术**。它是在 Next.js App Router 中引入的一种新型 React 组件。它的核心特点是：

1.  **纯粹在服务器运行**: RSC 的代码（包括其依赖）永远不会被打包发送到浏览器，从而实现"零客户端 JS 体积"。
2.  **直接访问数据源**: 可以在组件内部直接编写访问数据库、文件系统或内部 API 的代码，就像在传统的后端应用中一样。
3.  **与 UI 紧密耦合**: 数据获取逻辑和使用这些数据的 UI 渲染逻辑被放在同一个文件里，实现了高度的"关注点共置 (co-location)"。

**RSC 的产出物是一种特殊的、可流式传输的 UI 描述格式（不是 HTML，也不是 JSON），React 在客户端可以用它来高效地更新 DOM。**

---

## RSC vs. BFF：对比分析

| 特性           | 传统 BFF (Backend for Frontend)                    | Next.js RSC (React Server Components)                        |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| **核心身份**   | 一种**架构模式**，一个独立的、可部署的服务。       | 一种**组件技术**，深度集成在 Next.js 渲染生命周期中。        |
| **主要产出**   | **JSON 数据**                                      | **可渲染的 UI 描述**                                         |
| **数据流**     | `前端 -> BFF(获取/聚合JSON) -> 前端(用JSON渲染UI)` | `请求 -> RSC(获取数据并直接渲染UI) -> 客户端(展示UI)`        |
| **耦合方式**   | **解耦**：通过 API 契约将前后端分离。              | **共置 (Co-location)**：将数据获取逻辑和使用它的 UI 组件放在一起。 |
| **解决的问题** | 解决了**跨团队协作**和**后端架构复杂性**的问题。   | 解决了**前端 JS 包体积过大**和**数据获取瀑布流**的问题。     |

### 相似之处 (它们都能...)

- 在服务器上运行。
- 聚合来自多个数据源的数据。
- 隐藏 API 密钥和敏感逻辑，不暴露给客户端。
- 充当了浏览器和底层数据源之间的中间层。

### 核心区别：产出物的不同

这是最本质的区别：

- **BFF 说**："嘿，前端，这是你需要的所有数据（JSON），你自己看着办，用它们去构建你的界面吧。"
- **RSC 说**："嘿，前端，我已经用数据把这个组件（比如一个用户信息卡片）在服务器上渲染好了，你直接把它摆在页面上就行。"

## 结论：RSC 是 BFF 理念的演进

可以说，**RSC 将 BFF 的核心思想（在靠近前端的地方聚合和处理数据）内化到了框架的组件层级**。

- 对于许多 Next.js 应用来说，你不再需要一个**独立部署的 BFF 服务**。你的服务器组件本身就扮演了这个角色，它们既是数据获取器，又是模板渲染器。这种方式简化了开发和部署，因为你的"BFF 逻辑"和你的"UI 逻辑"天然地结合在了一起。

- 然而，在超大规模的、有多个不同前端（例如 Web、iOS、Android）的应用中，一个独立的、返回通用 JSON 的 BFF 服务仍然有其价值，因为它可以为所有客户端提供统一的数据出口。

总而言之，**RSC 实现了和 BFF 类似的作用，但它通过一种与视图层更紧密集成的方式，从而在很多场景下让你不再需要一个单独的 BFF 层。**

---

## 常见问题与深入思考

### 1. 传统 CSR 应用不也挺快的吗，为什么要用 SSR/RSC？

这是一个非常好的问题。传统 CSR (Client-Side Rendering) 应用，例如用 Create React App 或纯 Vite 创建的 SPA (Single Page Application)，在**应用加载完成之后**，页面间的跳转确实非常快，因为它们只是在客户端动态替换 DOM，无需刷新整个页面。

但这里的关键是"加载完成之后"。CSR 模式存在两个核心的、难以根治的痛点，而 SSR (Server-Side Rendering) 和 RSC (React Server Components) 正是为了解决它们而生的：

- **糟糕的初始加载性能 (FCP/TTFB)**:

  - **CSR 流程**: 浏览器首先下载一个几乎空白的 HTML 文件 -> 然后下载巨大的 JavaScript 包 -> 然后在浏览器中执行 JS -> 然后发起数据请求 -> 最后才渲染出完整的页面。
  - **用户体验**: 在这个漫长的过程中，用户会长时间面对一个白屏或者加载指示器。这对应用的**第一印象**是致命的，尤其是在网络环境较差的情况下。
  - **SSR/RSC 优势**: 服务器直接将渲染好的、包含内容的 HTML 发送给浏览器。浏览器一收到就能立刻显示页面内容，极大地优化了**首次内容绘制 (FCP)** 时间。用户能更快地看到信息，即便此时 JS 还没加载完（页面还不可交互）。

- **对 SEO 不友好**:
  - **CSR 的挑战**: 搜索引擎的爬虫在抓取页面时，不一定会等待所有 JavaScript 执行完毕。如果它只看到了一个空白的 HTML 框架，那么你的页面内容就无法被有效索引，从而影响搜索排名。
  - **SSR/RSC 优势**: 由于服务器直接返回了完整的 HTML 内容，爬虫可以毫无障碍地读取和索引所有信息，这是对 SEO 最友好的方式。

**结论**：选择 SSR/RSC，本质上是用服务器的计算资源，换取**最终用户**在初始加载时拥有更快的响应速度和更好的内容消费体验，并确保应用内容能被搜索引擎完全理解。

### 2. 将首页做 RSC，后续部分做 CSR，不就可以了吗？

你的这个想法，恰好精确地描述了 Next.js App Router 的**核心工作模式**——**混合式渲染 (Hybrid Rendering)**。

Next.js 的目标**并不是**用服务器渲染取代一切，而是集两者之长：

1.  **首次访问**: 通过 RSC/SSR 提供极速的初始加载和完美的 SEO。
2.  **后续导航**: 行为和 CSR 应用一样，通过客户端路由 (`<Link>` 组件) 实现快速、无刷新的页面跳转。

那么，为什么还需要那么多复杂的概念呢？因为要将这两种模式**无缝地、高效地**结合起来，并解决纯 CSR 留下的各种问题，你需要一个更完善的体系：

- **无缝的客户端路由**: 纯 CSR 需要你手动配置路由库。Next.js 的 `<Link>` 组件不仅实现了客户端导航，还会在后台**自动预取 (pre-fetching)** 即将访问页面的代码和数据。这使得用户点击链接时，页面几乎是"秒开"的，体验远超常规 CSR。
- **统一的数据获取模型**: 在纯 CSR 中，每个页面都需要用 `useEffect` 来处理数据获取、加载状态和错误状态，非常繁琐。在 Next.js 中，无论是 RSC 还是客户端组件，数据获取的方式都更加统一和简洁，框架帮你处理了大量的底层逻辑。
- **解决"瀑布流"问题**: `Suspense` 让你可以在服务器上就规划好流式渲染的边界，避免了客户端组件一个接一个挂载、一个接一个请求数据的"瀑布流"问题。
- **服务端能力的延续**: `Server Actions` 这样的概念，让你**即使在客户端**也能轻易地调用在服务器上定义的函数（例如，提交一个表单），而无需手动编写一个 API Endpoint。这让你在整个应用生命周期中都能方便地利用服务器的能力。

**结论**：Next.js 实现的众多概念，是为了打造一个**工程上更优越的混合式框架**。它为你处理了缓存、代码拆分、预取、数据同步等一系列极其复杂的问题，让开发者能以一种更简单的心智模型，同时享受到 SSR 和 CSR 的好处。

### 3. RSC 真的提升了很多工作效率吗？

对于这个问题，答案是：**在度过初期的学习曲线后，是的，它能极大地提升工作效率。**

效率的提升主要体现在以下几个方面：

- **终极的关注点共置 (Co-location)**:

  - **传统方式**: 你需要在一个组件里（比如 `useEffect`）发起请求，在另一个地方（`/api` 目录）定义 API 路由，可能还需要在状态管理库（Redux/Zustand）中定义 state。数据逻辑和 UI 逻辑被割裂在多个文件中。
  - **RSC 方式**: 数据获取（`fetch`、数据库查询）和使用这些数据的 UI 渲染**被放在同一个组件文件里**。这极大地降低了理解和维护成本，当你想修改某个功能时，所有相关的代码都在一个地方。

- **告别 `useEffect` 数据获取**:

  - 在客户端组件中，使用 `useEffect` 获取数据是 React 开发中最复杂、最容易出错的部分之一。你需要手动处理加载状态、错误状态、重复请求、依赖项数组等。
  - 在 RSC 中，一个简单的 `async/await` 就解决了。代码更短、更易读、更健壮。

- **减少了大量 API 模板代码**:

  - 在很多场景下，你不再需要为了让前端获取数据而专门创建一个 API 路由。服务器组件可以直接访问数据源，它本身就充当了数据层和视图层的结合体。这对需要进行大量数据增删改查的后台管理系统等应用来说，是颠覆性的效率提升。

- **更少的客户端状态管理**:
  - 很多全局状态（如用户信息、主题配置）现在可以由顶层的服务器组件获取，并通过 props 或 Context 传递下来。很多原先需要用 Zustand 或 Redux 缓存的"服务器状态"，现在可以完全交给 Next.js 的内置缓存处理，让客户端的状态管理库更专注于纯粹的"客户端状态"（如表单输入、弹窗开关等）。

**当然，挑战也存在**：RSC 引入了新的心智模型（"服务器 vs. 客户端"的边界、缓存策略、`'use client'` 和 `'use server'` 指令），这需要一个适应过程。但一旦你掌握了它的核心思想，开发体验会变得前所未有的流畅，因为你写的模板代码和"胶水代码"大大减少了。

---

## Next.js 缓存机制详解

Next.js 的高性能很大程度上归功于其智能且分层的缓存策略。它不是单一的缓存，而是一个协同工作的系统。理解这个系统是精通 App Router 的关键。

缓存机制主要由 **四层** 构成，从客户端到服务端，覆盖了从请求到数据获取的整个生命周期。

```mermaid
graph TD
    subgraph Client-Side (Browser)
        A[User navigates via <Link>] --> B{1. Router Cache};
        B -- HIT --> C[Show cached page instantly];
        B -- MISS --> D[Make request to server];
    end

    subgraph Server-Side (Next.js Server)
        D --> E{2. Full Route Cache};
        E -- HIT --> F[Return cached HTML & RSC Payload];
        E -- MISS --> G[Render the Route];

        subgraph "During Render Process"
            G -- Triggers data fetching --> H{3. Data Cache (fetch)};
            H -- HIT --> I[Return cached data];
            H -- MISS --> J[Fetch from external API/DB];
            J --> K[Store result in Data Cache];
            K --> I;

            G -- Calls a function --> L{4. Request Memoization};
            L -- First call --> M[Execute function, e.g., db.query()];
            M -- Caches result --> L;
            L -- Subsequent calls --> N[Return memoized result];
        end

        I --> G;
        N --> G;
        G -- Produces HTML & RSC Payload --> O[Store result in Full Route Cache];
        O --> F;
    end

    F --> B;
```

### 1. Router Cache (客户端路由器缓存)

这是位于**浏览器内存中**的、最接近用户的一层缓存。

- **作用**: 存储已访问过的路由的 RSC Payload（React 服务器组件的渲染输出）。当你通过 `<Link>` 组件在页面间跳转时，Next.js 会优先从这个缓存中加载目标页面，实现极速的、无需请求服务器的客户端导航。
- **生命周期**: 仅限用户的单次会话。当用户硬刷新页面时，此缓存被清空。
- **关键点**:
  - 这是 `<Link>` 组件实现"秒开"体验的核心。
  - Next.js 会自动**预取 (Prefetch)** 视口内 `<Link>` 指向的路由，提前填充此缓存。
  - 可以通过 `router.refresh()` 手动让此缓存失效并发起新的服务器请求。

### 2. Full Route Cache (服务端全路由缓存)

这是服务器端的**默认缓存**，它缓存静态路由的完整渲染结果。

- **作用**: 缓存页面的 HTML 和 RSC Payload。这使得静态生成 (SSG) 成为可能。对于一个静态页面，第一次构建后，其渲染结果就被存在这一层。后续所有对该页面的请求都会直接命中此缓存，服务器无需重新渲染。
- **生命周期**: 持久化。直到被手动或按时重新验证 (revalidate) 才会失效。
- **如何失效**:
  - **基于时间**: 在页面或布局中设置 `export const revalidate = N;` (N 为秒数)。
  - **按需**: 调用 `revalidatePath('/your-path')` 或 `revalidateTag('your-tag')`。

### 3. Data Cache (服务端数据缓存)

这是我们之前重点讨论过的、由 Next.js 扩展的 `fetch` API 提供的持久化数据缓存。

- **作用**: 缓存来自外部数据源（如第三方 API、数据库）的响应。这个缓存是跨请求、跨路由共享的。例如，如果两个不同的页面都 `fetch` 同一个用户数据 API，它们可以共享同一份数据缓存。
- **生命周期**: 持久化。默认情况下，`fetch` 的结果会被永远缓存，除非显式设置了重新验证策略。
- **如何控制**:
  - **在 `fetch` 中**:
    - `fetch(url, { next: { revalidate: N } })`: 设置该条数据的 ISR 有效期。
    - `fetch(url, { cache: 'no-store' })`: 完全不使用数据缓存，每次都重新请求。
    - `fetch(url, { next: { tags: ['...'] } })`: 为数据打上标签，便于按需批量失效。
  - **按需**: `revalidatePath` 和 `revalidateTag` 同样可以使相关的数据缓存失效。

### 4. Request Memoization (请求内函数记忆化)

这是生命周期最短的一层缓存，由 React 的 `cache` 函数提供（Next.js 的 `fetch` 自动包含了此功能）。

- **作用**: 在**单次**服务器渲染过程中，避免对同一函数的重复调用。想象一个场景：你的根 `layout.js` 和某个页面组件都调用了 `getUser()` 函数来获取当前用户信息。如果没有记忆化，这个函数会被执行两次，造成浪费。

- **生命周期**: 仅限单次服务器请求-渲染周期。请求结束后，此缓存立即被销毁。

- **如何使用**:

  - `fetch` 请求自动享受此优化。

  - 对于非 `fetch` 的函数（如数据库查询），可以用 `import { cache } from 'react'` 包裹起来：

    ```javascript
    import { cache } from 'react'
    import db from './db'
    
    export const getUser = cache(async (id) => {
      return await db.user.findUnique({ where: { id } })
    })
    ```

### 总结

这四层缓存机制环环相扣：

- **Router Cache** 提供了最快的客户端导航体验。
- **Full Route Cache** 实现了高性能的静态服务，降低了服务器负载。
- **Data Cache** 减少了对外部数据源的重复请求，提升了构建和渲染速度。
- **Request Memoization** 在单次渲染内部优化了函数调用，避免了资源浪费。

理解并善用这个多层缓存系统，是构建高性能、高效率 Next.js 应用的根本。

---

## Server Actions 只能处理表单吗？

不。虽然与 `<form>` 结合是 Server Action 最主要、最强大的用例（因为它能提供渐进增强），但它们本质上只是可以从客户端调用的函数。你完全可以在没有 `<form>` 的情况下使用它们。

最常见的非表单用例就是从一个事件处理器（如 `onClick`）中调用 Server Action。

**关键点：`useTransition`**

当你脱离 `<form>` 使用 Server Action 时，你就无法使用 `useFormStatus` 来获取 pending 状态了。在这种情况下，你需要使用 React 的 `useTransition` Hook。

`useTransition` 提供了一个 `isPending` 状态和一个 `startTransition` 函数。你可以将你的 Server Action 调用包裹在 `startTransition` 中，`isPending` 标志就会在 Action 运行时变为 `true`。

**示例：实现一个"点赞"按钮**

假设我们有一个 Server Action 用来给文章点赞：

```javascript
// app/posts/actions.js
'use server'

import { revalidatePath } from 'next/cache'
import db from '../lib/db'

export async function likePost(postId) {
  await db.post.update({
    where: { id: postId },
    data: { likes: { increment: 1 } },
  })
  revalidatePath(`/posts/${postId}`)
}
```

现在，我们在一个客户端组件中使用它：

```jsx
// app/posts/like-button.js
'use client'

import { useTransition } from 'react'
import { likePost } from './actions'

export function LikeButton({ postId }) {
  // 1. 使用 useTransition Hook
  let [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => {
        // 2. 将 Server Action 调用包裹在 startTransition 中
        startTransition(() => likePost(postId))
      }}
    >
      {isPending ? 'Liking...' : 'Like'}
    </button>
  )
}
```

#### 总结：何时使用哪种方式？

- **使用 `<form action={...}>`**:

  - 当你的 UI 语义上就是一个表单时（例如，创建、更新、搜索）。
  - 当你想要获得**渐进增强**能力（即使用户禁用了 JS 也能工作）。
  - 这是**首选**和**默认**的方式。

- **使用 `useTransition` + `onClick`**:
  - 当 UI 交互不是一个表单时（例如，点赞、删除单个项目、切换开关）。
  - 当渐进增强不重要或不适用时。
  - 这是一个灵活的**补充**方式。

---

## Server Actions vs. 传统后端 API

这是一个非常核心的架构问题。虽然 Server Actions 和传统 API（如 REST API）最终都在服务器上执行代码，但它们的**设计哲学、集成方式和开发者体验**截然不同。

**核心区别在于：集成与解耦。**

- **传统 API**: 是一个**解耦 (Decoupled)** 的系统。API 是一个独立的服务，它通过通用的 HTTP 和 JSON 协议与外界通信。它不关心是谁在调用它（Web 前端、移动 App、另一个后端服务），只要请求符合规范即可。这使得它非常**可复用**。
- **Server Actions**: 是一个与 UI **紧密集成 (Tightly Integrated)** 的系统。它本质上是 React 组件树的一部分，只不过框架通过 RPC 的方式让它在服务器上运行。它的主要职责就是服务于它所连接的那个特定 UI。

### 详细对比

| 特性          | 传统后端 API (e.g., REST)                                    | Next.js Server Action                                        |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **身份/本质** | 独立的 HTTP 端点 (e.g., `POST /api/users`)                   | 一个被 `'use server'` 标记的、可导出的函数                   |
| **调用方式**  | `fetch('/api/users', { method: 'POST', body: '...' })`       | 直接调用函数 `addUser(formData)`                             |
| **数据格式**  | 通常是 JSON                                                  | 普通的函数参数，无需序列化/反序列化                          |
| **状态管理**  | **手动**：`useState` 管理 loading/error, `useEffect` 触发请求 | **自动**：内置的 `useTransition` / `useFormStatus` Hooks     |
| **数据刷新**  | **手动**：客户端在成功后必须手动重新获取数据                 | **内置**：直接调用 `revalidatePath` 或 `revalidateTag` 即可自动刷新 |
| **渐进增强**  | 默认不适用                                                   | 当与 `<form>` 结合时**自动支持**                             |
| **典型用例**  | 为多个客户端（Web, Mobile）提供数据、Webhook、公共 API       | 单一 Next.js 应用内部的 UI 驱动的数据变更操作                |
| **代码位置**  | 逻辑位于独立的文件/目录中 (e.g., `app/api/**`)               | 逻辑可以与使用它的组件**共置 (co-located)** 在同一个文件中   |

### 结论：何时使用哪一个？

在同一个 Next.js 应用中，你可以同时使用它们。选择哪一个取决于你的具体需求。

#### 使用 Server Actions (默认和首选)

- **应用内部的绝大多数用户交互**。
- **所有表单提交**：创建、更新、删除操作。
- **所有由 UI 驱动的数据变更**：点赞、收藏、添加到购物车等。
- **简而言之**：当你想在响应用户操作时改变服务器上的数据，并让 UI 自动更新时，Server Actions 是最直接、最高效的选择。

#### 使用传统 API 路由

- 当你需要暴露一个**公共 API** 给第三方开发者或服务时。
- 当你需要为**其他客户端**（如原生移动 App）提供数据源时。
- 当你需要接收来自外部服务的 **Webhook** 时（例如，Stripe 的支付通知、GitHub 的事件推送）。
- 当你需要一个与 Web UI 完全解耦、严格版本化的 API 协议时。

总结来说，**Server Actions 优化了"为 UI 而生"的后端逻辑，而 API 路由则服务于更广泛的、系统间的通信需求。**

---

## 但 Server Action 的底层不也是 API 路由吗？

这是一个非常敏锐的洞察！是的，你说得完全正确。**在最底层，Server Action 的调用最终也是通过一个由 Next.js 框架自动创建和管理的、私有的 API 端点来实现的。**

那么，如果底层机制相同，它们的区别又在哪里呢？

关键在于**抽象层次 (Level of Abstraction)** 和 **开发者体验 (Developer Experience)**。

这里有一个绝佳的类比，可以帮助理解：

> Server Actions 与传统 API 路由的关系，就像 **ORM (如 Prisma, Drizzle) 与原生 SQL 查询** 的关系一样。

|                | **原生 SQL (更底层)**                       | **ORM (更高层抽象)**                          |
| -------------- | ------------------------------------------- | --------------------------------------------- |
| **做什么**     | 手动编写 `INSERT INTO "users" ...` 字符串。 | 调用 `db.user.create({ data: {...} })` 方法。 |
| **开发者体验** | 繁琐、易出错、需要手动处理大量细节。        | 简洁、类型安全、只需关注业务逻辑。            |
| **底层机制**   | **数据库最终执行的都是 SQL。**              | **ORM 在底层依然是生成和执行 SQL。**          |

尽管底层都是 SQL，但 ORM 通过提供一个更高层次的抽象，极大地提升了开发效率和代码质量。

---

现在，让我们将这个类比应用到 Next.js 中：

|                | **传统 API 路由 (更底层)**                                   | **Server Actions (更高层抽象)**                            |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| **做什么**     | - 手动创建 `route.js` 文件。<br>- 处理 `request`/`response` 对象。<br>- 手动序列化/反序列化 JSON。<br>- 客户端手动 `fetch` 并管理状态。 | - 只需写一个异步函数并标记 `'use server'`。                |
| **开发者体验** | 繁琐、需要编写大量模板代码、前后端逻辑分离。                 | 简洁、与 UI 共置、状态管理和数据刷新与框架无缝集成。       |
| **底层机制**   | **最终都是一个在服务器上运行的 HTTP 端点。**                 | **框架在底层依然是创建和调用一个私有的 HTTP 端点 (RPC)。** |

### 结论

你正确地指出了它们的底层共性。但这恰恰凸显了 Server Actions 的价值所在。

**Server Actions 把创建和管理这个"隐式 API 路由"的所有繁琐工作都封装了起来**，包括：

- 端点的创建与路由。
- 请求和响应的序列化。
- 与 React 并发特性和 Hooks (如 `useTransition`) 的深度集成。
- 与 Next.js 缓存和重新验证机制 (`revalidatePath`) 的无缝衔接。

最终，你得到的不是一个需要你手动管理的 HTTP 端点，而是一个简单的、可以从你的组件中直接调用的类型安全的函数。这是一种巨大的开发模式的进步。

## 为什么 RSC 要序列化 VDOM，直接返回 HTML 不好吗？

这是一个非常深入且关键的技术问题。从表面看，直接返回 HTML 确实是最简单、最符合直觉的方式。

然而，RSC (React Server Components) 的目标远不止于**首次页面加载**。它更核心的目标是实现**客户端 UI 的无损、高效更新**。为此，它返回的 RSC Payload 是一种比纯 HTML **信息含量丰富得多**的特殊序列化格式。

可以把它们想象成 **"宜家家具包裹"** 和 **"家具成品照片"** 的区别：

- **传统 SSR 返回的 HTML**：就像一张**家具的成品照片**。你只能看到最终的样子，但不知道它是如何组成的，哪些部分是活动的。
- **RSC 返回的 Payload**：就像一个**宜家家具的快递包裹**。打开它，里面有：
  1.  **大部分已经组装好的木板** (Server Component 产生的静态 HTML)。
  2.  **几包螺丝和零件** (Client Component 的"占位符"或"洞")。
  3.  **一本详细的安装说明书** (如何将客户端组件精确地安装到指定位置，以及如何与现有 UI 合并的指令)。

### RSC Payload 包含哪些 HTML 没有的信息？

#### 1. 客户端组件的"洞" (Client Component Holes)

这是最核心的一点。RSC 必须告诉在浏览器中运行的 React："这部分是服务器渲染的 HTML，但**这个特定的位置**需要由一个客户端组件 (`Counter.js`) 来填充，并且这里是加载它所需要的 JavaScript 资源 (`counter.chunk.js`) 的引用。"

纯 HTML 无法表达这种"这是一个需要交互能力的组件"的元信息。

#### 2. 无损的 UI 合并指令 (Diffing & Merging)

当你通过 `router.refresh()` 或 Server Action 触发一次 UI 更新时，服务器会重新运行 RSC 并发回一个新的 Payload。React 在客户端**不会**像 `innerHTML` 一样粗暴地替换整个页面。

- **`innerHTML = newHTML` 的问题**：这种方式是毁灭性的。它会摧毁所有现存的 DOM 节点，导致客户端的状态（如输入框的文字、`useState` 的值、视频播放进度）全部丢失。
- **RSC Payload 的优势**：它包含了足够的信息，让 React 可以在客户端进行高效的"树比对 (Tree diffing)"。React 能够精确地计算出新旧 UI 之间的最小差异，然后只对 DOM 进行必要、精准的修改（例如，"只更新这个 `<span>` 的文本"或"在这里插入一个新的 `<li>`"），同时**完整地保留所有未受影响的客户端组件及其状态**。

#### 3. 与 `Suspense` 结合的流式传输

RSC Payload 的格式是专为流式传输设计的。服务器可以先发送一部分已经渲染好的 Server Component HTML，让用户立刻看到内容。然后，在同一个请求流中，陆续发送客户端组件的占位符和数据，客户端 React 收到后会渐进式地将它们填充到正确的位置。

### 对比总结

| 特性           | 直接返回 HTML                                  | 返回 RSC Payload                                             |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| **内容**       | 纯粹的、静态的 HTML 标签。                     | HTML、客户端组件占位符、JS 资源引用、以及 UI 合并指令。      |
| **客户端组件** | 无法表达"这是一个客户端组件"的概念。           | 精确标记客户端组件的位置和依赖。                             |
| **UI 更新**    | 只能全量替换 (`innerHTML`)，会丢失客户端状态。 | 可进行高效的 diff 与合并，实现**无损更新 (state-preserving updates)**。 |
| **核心目标**   | 尽快完成**首次渲染 (First Paint)**。           | 在实现快速首次渲染的同时，赋能后续的**高性能、无缝的 UI 状态同步**。 |

**结论：**

RSC 不直接返回 HTML，是因为它的设计目标是一个**双向的、持续的 UI 同步协议**，而不仅仅是一个单向的页面渲染器。它序列化的"类 VDOM"格式，本质上是一套丰富的**指令集**，指导着客户端 React 如何高效、无损地将服务器的最新状态同步到用户的屏幕上。
