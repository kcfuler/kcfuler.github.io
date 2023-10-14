> https://jakelazaroff.com/words/an-interactive-intro-to-crdts/

# 什么是 CRDT 算法

CRDT=“Conflict-free Replicated Data Type”，它是一种数据结构，能够保证在本地对它的副本修改之后，最终多份副本能够无冲突的合并。这样的形态避免了中央服务器来对数据进行同步，这也使得它很适合应用于多人协作的应用，像 figma，google docs 就使用了它

一般来说，有两种类型的 CRDT 算法：

1. 基于 state，使用 CRDT 算法的主机之间会交换全部的 state 数据，用于构建合并后的数据
2. 基于 action，主机之间只交换用户的操作记录，并用它来计算新的数据

