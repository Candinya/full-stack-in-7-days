# 后记

竟然能更新完这个课题，我自己都有些感到不可思议。

起初立项的时候只是随口一提，包括在另外一个朋友群里说有空了可以给大家讲讲程序相关的东西，就想着看看过年时候反正闲着也是闲着，不如做点有意义的事情。只是没想到这工程量远远超出了我的想象，过年时候到处跑结果就只写完了一小部分，后面陆陆续续才更新出来这么多。

中途好几次想要弃坑，但想了想都已经写了那么多了，哪怕剩下的再随便列个提纲也比说弃坑了要好，就这样拖着拖着直到现在才算完整收工。

但其实我自己也知道这写得并不好。由于篇幅限制，不能无止境地写下去，所以很多东西其实是压了再压的，并且不少表达对新手来说属于完全理解不能的那种。更可怕的是，因为我自己能看明白我写的东西，所以我无法想象出看不明白的点——这也是一种「知识的诅咒」。

但无所谓，任何疑问欢迎随时留言，我有空的时候看到了会来回复的。

如果这是一门课程的话，那恭喜各位完成收尾了——~~该准备期末大作业了（开个玩笑）~~。

无论是有收获，还是没收获，还是看了一会觉得非常催眠，都是非常正常的。我写这个也并不是当作教科书来制定的，并且实际上很多东西还都是要自己上手试一试，并且去多了解了解才能有更深刻的体会。

话说回来，所谓的 7天 也只是一个噱头（虽然我原来的计划里确实是每天学一点的，但没想到写着写着变成了每天学亿点），要是有人能真的只需要 7天 就能全部理解的话，那这位之前付出的积累绝对远远不是一般通过新手开发者的水平。很多东西是要靠尝试去得出来的，包括我自己的编程（修电脑）经历也是从小学四年级开始接触学习，所以一直到现在才会看起来好像比别人多懂了一些，实际上并没有太大的区别，也不存在谁比谁更厉害的情况。科技的飞速发展意味着全新的信息会以一种惊人的速度爆发式产生，无论是新的开发语言、新的项目框架、新的结构技巧，很多时候都需要靠最前沿的尝试获得，而不是仅仅将目光局限于过去的辉煌之中，被时代的洪流淘汰。

在 Day 1 中我是讲过现在一些错误利用大语言模型导致得到离谱的代码的情况，但这也只是针对向现在这种不精确的模型凭空提出需求来说的。对于代码补全任务来说， 早在之前内测阶段的 GitHub Copilot 就已经表现出了相当惊人的实力， JetBrains 2024.1 的工具中更是已经全量实装了本地运行的一行代码补全工具，利用这些工具编写程序可以说能非常迅速地提升开发的效率。那未来呢？或许有一天，当 AI 能理解它自己的底层代码之后，一切又都将会变得不一样吧。

最后，如果您在受到这么多晦涩难懂的知识纠缠之后还是愿意尝试全栈开发的话，那么在此我向您送上最诚挚的祝福，祝愿您写的代码行行无错误、程序个个跑顺心，在信息的洪流中寻找到属于自己的一方乐土！

完结撒花！

Nya Candy

2024.04.16 00:54（不要在半夜干活！）

<script setup>

import { onMounted } from 'vue'
import confetti from 'canvas-confetti'

onMounted(() => {
  const end = Date.now() + 0.5 * 1000;
  // cheers!
  const colors = ['#ED7F55', '#FED581'];
  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
})

</script>