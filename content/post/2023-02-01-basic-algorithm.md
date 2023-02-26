---
layout:     post 
title:      "基础算法模板"
subtitle:   "记录算法学习"
description: "学习自acwing基础课"
date:       2023-02-01
author:     "kcfuler"
URL: "/2023/02/01/basic-algorithm/"
categories: [ tech ]
tags: 
    - cs

image:      "https://dogefs.s3.ladydaily.com/~/source/unsplash/photo-1651429753289-e5cb65123a32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1348&q=80"

---

## 基础算法

### 排序

#### 快排

```none
#include <iostream>
using namespace std;

const int N = 1e6 + 10;

int a[N];

void quick_sort(int a[] , int l , int r){

if( l >= r) return ;

int x = a[(r+l)/2] , i = l - 1 ,  j = r + 1;

while( i < j ){
    do i ++ ; while( x > a[i]);
    do j -- ; while( x < a[j]);
    if( i < j ) swap( a[i] , a[j]);
}

quick_sort(a, l , j);
quick_sort(a, j+1 , r);
}

int main (){
int n;
scanf(“%d” , &n);

for( int i = 0 ; i < n ; i++) scanf("%d" , &a[i]);

quick_sort(a , 0 , n-1);

for( int i = 0 ; i < n ; i++) printf("%d " , a[i]);

return 0;
}
```

##### 快速选择算法

```none
#include <iostream>
using namespace std;

const int N = 1e6 + 10;
int q[N];

int quick_sort(int l , int r , int k){
if( l == r ) return q[l];

int x = q[(l + r) / 2] , i = l - 1 , j = r + 1;

while( i < j ){
    do i ++ ; while( x > q[i]);
    do j -- ; while( x < q[j]);
    if( i < j ) swap( q[i] , q[j]);
}

int sl = j - l + 1; // 用来确定k在数组中的相对位置

if( k > sl ) return quick_sort( j + 1 , r , k - sl);
return quick_sort( l , j , k );
}

int main (){

int n , k;

cin>>n>>k;

for(int i = 0 ; i < n ; i++) cin>>q[i];

cout<< quick_sort(0, n - 1 , k)<<endl;

return 0;
}
```

#### 归并排序

##### 基础模板

```none
#include <iostream>
using namespace std;

const int N = 1e6+10;
int a[N] , tmp[N];// 归并需要额外空间

void merge_sort(int a[] , int l , int r){
    if( l >= r) return ;

    int mid = (l + r) >> 1;

    merge_sort(a, l , mid ) , merge_sort( a, mid + 1, r);

    int k = 0  , i = l , j = mid + 1;
    //将数据 按顺序 转移到临时数组中
    while( i <= mid && j <= r){
        if( a[i] >= a[j] ) tmp[k++] = a[j++];
        else tmp[k++] = a[i++];
    }
    while( i <= mid ) tmp[k++] = a[i++];
    while( j <= r) tmp[k++] = a[j++];

    for( i = l , j = 0 ; i <= r ; i ++ , j ++) a[i] = tmp[j]; // 排序好之后转移回去
}

int main (){
    int n;
    scanf(“%d”, &n);

    for(int i = 0; i < n ;i ++) scanf("%d" , &a[i]);

    merge_sort(a, 0 , n - 1);

    for(int i = 0 ;i < n ;i++) printf("%d " , a[i]);

    return 0;
}
```

##### 逆序对

```none
#include <iostream>
using namespace std;

typedef long long LL;

const int N = 1e5 + 10;
int a[N] , tmp[N];

LL res = 0;

LL merge_sort(int l , int r){
    if(l >= r) return 0;

    int mid = l + r >> 1;

    res = merge_sort( l , mid ) + merge_sort( mid + 1, r);

    int k = 0 , i = l , j = mid + 1 ;

    while( i <= mid && j <= r){
        if( a[i] <= a[j]) tmp[k ++] = a[i ++];
        else{
            tmp[k ++] = a[j ++];
            res += mid - i + 1;//逆序对在两个有序数组中，通过相对位置得到的性质
        }
    }

    while( i <= mid ) tmp[k ++] = a[i ++];
    while( j <= r) tmp[k ++] = a[j ++];

    for(int i = l , j = 0 ; i <= r  ;i ++ ,j ++) a[i] = tmp[j];

    return res;
}

int main (){
    int n ;

    cin>>n;

    for( int i = 0 ; i < n ; i ++ ) cin>>a[i];

    cout<< merge_sort(0 , n - 1 );

    return 0;
}
```

#### 二分

##### 模板

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int a[N];

int main (){
    int n , m ;
    cin>>n>>m;

    for(int i = 0 ;i < n ;i++) cin>>a[i];

    while( m --){
        int k ;
        cin>>k;

        int l = 0 , r = n - 1 ;

        while ( l < r){
            int mid = ( l + r ) >> 1; // 下界

            if( a[mid] >= k) r = mid;
            else l = mid + 1;
        }

        if( a[l] != k) cout<<"-1 -1"<<endl;
        else {

            cout<<l<<" ";

            int l = 0 , r = n - 1;
            while( l < r ){
                int mid = ( l + r + 1 ) >> 1;//上界

                if( a[mid] <= k) l = mid;
                else r = mid - 1;
            } 
            cout<<r<<endl;
        }
    } 

    return 0;
}
#include <iostream>
using namespace std;

int main (){
    double k ;
    cin>>k;
    
    double l = -10000, r = 10000;
    
    while( r - l > 1e-8){ // 注意是要越来越接近
        
        double mid = ( l + r ) / 2 ;
        
        if( mid * mid * mid >= k) r = mid;
        else l = mid;
    }
    
    printf("%.6lf\n",l);//控制小数数位的输出很好用
    
    return 0;
}
```

### 前缀和与差分

#### 前缀和

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int a[N] , pre[N];

int main (){
    int n , m;
    scanf("%d%d" ,&n ,& m);

    for(int i = 1 ; i <= n ;i++) scanf("%d" , &a[i]);

    for(int i = 1 ; i <= n ;i++) pre[i] = pre[i - 1] + a[i];

    while( m --){
        int s  , e ;
        scanf("%d%d" , &s,&e);
        printf("%d\n", pre[e] - pre[ s - 1 ]);
    }

    return 0;
}
#include <iostream>
using namespace std;

const int N = 1e3 + 10;
int a[N][N] , s[N][N];

int m , n , q;

int main (){

    cin>>n>>m>>q;//注意矩阵的读入

    for(int i = 1 ; i <= n ;i ++)
        for( int j = 1 ; j <= m ; j++)
            cin>>a[i][j];

    for(int i = 1; i <= n ;i ++)
        for(int j = 1 ; j <= m ; j++)
            s[i][j] = s[i-1][j] + s[i][j-1] - s[i-1][j-1] + a[i][j];

    while( q --){
        int x1, y1, x2,y2;
        cin>>x1>>y1>>x2>>y2;

        int res = s[x2][y2] - s[x1-1][y2] - s[x2][y1 - 1] + s[x1 - 1][y1 - 1];

        cout<<res<<endl;
    }

    return 0;
}
```

#### 差分

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int a[N] , s[N];

void insert(int l , int r , int v){
    s[l] += v;
    s[r+1] -= v;
}

int main(){
    int n , m ;
    cin>>n>>m;
    
    for(int i = 1 ;i <= n ;i++) cin>>a[i]; // 读入初始数组
    
    for(int i = 1 ;i <= n ;i++) insert(i , i ,a[i]); // 初始化差分数组（等价为在每一个位置添加对应的a[i]）
    
    while( m --){
        int l , r , c;
        cin>>l>>r>>c;
        insert(l,r,c);//进行区间的操作
    }
    
    for(int i = 1 ;i <= n ;i++) s[i] = s[i] + s[i - 1]; // 还原，前缀和 
    
    for(int i = 1 ;i <= n ;i++) cout<<s[i]<<" "; 
    
    return 0;
}
#include <iostream>
using namespace std;

const int N = 1e3 + 10;
int a[N][N],s[N][N];

//二维差分，想象矩阵的面积变化
void insert(int x1 , int y1, int x2 , int y2, int c){
    s[x1][y1] += c;
    s[x2 + 1][y1] -= c;
    s[x1][y2 + 1] -= c;
    s[x2 + 1][y2 + 1] += c;
}

int main (){
    int n , m, q;
    cin>>n>>m>>q;

    for(int i = 1 ; i <= n ;i++)
        for(int j = 1 ;j <= m ;j++)
            cin>>a[i][j];

    for(int i = 1 ; i <= n ;i++)
        for(int j = 1; j <= m;j++)
            insert(i , j , i , j , a[i][j]);// 边界，构造差分数组

    while( q--){
        int x1,y1,x2,y2,c;

        cin>>x1>>y1>>x2>>y2>>c;

        insert(x1,y1,x2,y2,c);
    }

    for(int i = 1; i <= n;i ++)
        for(int j = 1 ; j <= m ;j ++)
            s[i][j] = s[i][j] + s[i - 1][j] + s[i][j - 1] - s[i - 1][j - 1]; // 前缀和，还原为操作后的数组

    for(int i = 1; i <= n;i ++)
    {
        for(int j = 1 ; j <= m ;j++) cout<<s[i][j]<<" ";
        cout<<endl;
    }

    return 0;
}
```

### 双指针

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int a[N] , c[N];

int main (){
    int n;
    cin>>n;

    for(int i = 0 ; i < n ; i ++) cin>>a[i];

    int res = 0 , j = 0;

    for(int i = 0 ; i < n ; i ++){
        c[a[i]]++;

        while( c[a[i]] > 1){

            c[a[j]]--; // 清除对前面的数的计数
            j++;
        }

        res = max( res , i - j + 1);
    }

    cout<<res<<endl;

    return 0;
}
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int a[N] , b[N];

int main (){
    int n , m , x;
    cin>>n>>m>>x;
    
    for(int i = 0; i < n ;i++) cin>>a[i];
    
    for(int i = 0; i < m ;i++) cin>>b[i];

    for(int i = 0 , j = m - 1; i < n , j >= 0 ;i++)
    {
        while(a[i] + b[j] > x) j--;
        if(a[i] + b[j] == x) 
        {
            cout<<i<<" "<<j<<endl;
            break;
        }
    }
    
    return 0;
}
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int a[N], b[N];

int main ()
{
    int n , m ;
    cin>>n>>m;

    for(int i = 0 ; i < n ; i++) cin>>a[i];
    for(int j = 0 ; j < m ; j++) cin>>b[j];

    int i = 0 , j = 0;
    while( i < n && j < m){
        if( a[i] == b[j]) i++;
        j++;
    }

    if( i == n) puts("Yes");
    else puts("No");

    return 0;
}
```

- 

  先想清楚 i 和 j 要如何变化，重要的是思想。

### 位运算

这里只涉及到两种常用的位运算

1. n的二进制中第k位是几

```
n >> k & 1
```

1. lowbit -- 获得最后一个1

```none
#include <iostream>
using namespace std;

int lowbit(int x){//取到最后一个1
    return x & -x;
}

int main (){
    int n ; 
    cin>>n;
    
    while( n --){
        int x ;
        cin>>x;
        
        int res = 0;
        
        while(x) x-=lowbit(x), res+=1; // 减为0的时候就得到了1的个数
        
        cout<<res<<" ";
    }
    
    return 0;
}
```

### 离散化

这里指的是有序的离散化

#### 个人一些理解（有误望指正）

1. 离散化的几个必须步骤
2. 使用一个数组存储**源数组的下标**
3. 对存储下标的数组进行**排序和去重** ， 主要是为了保证二分的效率 和 节约空间
4. 使用**二分**实现下标的查找
5. 数轴是**有序**的，而排序之后的数组也是**有序**的

```none
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

typedef pair<int ,int > PII;

const int N = 3e5 + 10;
int n , m;
int a[N] , s[N];

vector<int> alls;
vector<PII> add, query;

int find(int x ){
    int l = 0  , r = alls.size() - 1;

    while( l < r){
        int mid = ( l + r ) >> 1;
        if( alls[mid] >= x) r = mid;
        else l = mid + 1;
    }

    return r + 1; // 这里的+1是为了配合构造前缀和
}
int main (){
    cin>>n>>m;

    while( n --){
        int x ,c ;
        cin>>x>>c;

        add.push_back({x,c});

        alls.push_back(x);
    }

    while ( m --){
        int l , r ;
        cin>>l>>r;
        query.push_back({l , r });

        alls.push_back(l);
        alls.push_back(r);
    }

    //排序+去重 , 这一步不能忘记，不然二分会出问题
    sort( alls.begin() , alls.end());
    alls.erase( unique(alls.begin(),alls.end()) , alls.end());

    //离散化
    for( auto item : add){
        int x = find( item.first );
        a[x] += item.second;
    }

    for( int i = 1 ; i <= (int)alls.size() ; i++) s[i] = s[i - 1] + a[i];//计算前缀和

    for( auto item : query){
        int l = find(item.first);
        int r = find(item.second);

        cout<<s[r] - s[l - 1]<<endl;
    }

    return 0;
}
```

### 区间合并

核心：

- 

  排序

- 

  双指针（？）

```none
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

typedef pair<int , int> PII;

void merge(vector<PII> &segs){
    sort(segs.begin() , segs.end());
    
    vector<PII> res;
    
    int st = -2e9  ,ed = -2e9; // 因为排序之后整个区间是递增的，所以用两个变量可以表示
    
    for(auto seg : segs){
        if( seg.first > ed){
            if( ed != -2e9) // 规避起始点
                res.push_back({st , ed});
	        st = seg.first , ed = seg.second;
        }
        else ed = max( ed , seg.second);
    }
    
    if( st != -2e9) res.push_back({st , ed}); // 避免为空的情况
    
    segs = res;
    
}

int main (){
    int n ;
    cin>>n;
    
    vector<PII> segs;
    
    while( n --){
        int st , ed ;
        cin>>st>>ed;
        
        segs.push_back({st,ed});
    }
    
    merge(segs);
    
    cout<<segs.size()<<endl;
    
    return 0;
}
```

# 数据结构

## 链表

这里的链表都是使用数组模拟的方式进行存储的。

### 单链表

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;

int e[N], ne[N], head, idx;//这里的idx 我觉得可以看做调用栈里面的指针，使用它来新建一个元素

void init(){
    head = -1;
    idx = 0;
}

void insert_to_head( int x)
{
    e[idx] = x, ne[idx] = head, head = idx, idx++;
}

void insert_to_next(int k, int x)
{
    e[idx] = x, ne[idx] = ne[k], ne[k] = idx, idx++;  
}

void remove(int k)
{
    ne[k] = ne[ne[k]];
}

int main ()
{
    int m ;

    cin>>m;

    init();

    while( m--)
    {
        int k, x;
        char op;

        cin>>op;

        if(op == 'H')
        {

            cin>>x;
            insert_to_head(x);
        }
        else if(op == 'D')
        {

            cin>>k;
            if(k == 0) head = ne[head];
            remove(k - 1);
        }
        else
        {

            cin>>k>>x;
            insert_to_next(k - 1, x);//注意 k 和 head初始值的对应关系
        }
    }

    for(int i = head; i != -1; i = ne[i]) cout<<e[i]<<" ";
    cout<<endl;

    return 0;
}
```

### 双链表

#### 基础模板

```none
#include <iostream>
#include <string>
using namespace std;

const int N = 1e5 + 10;
int e[N], l[N], r[N], idx;

void init(){
    l[1] = 0,r[0] = 1,idx = 2;
}

void insert(int k, int x)
{
    e[idx] = x, r[idx] = r[k], l[idx] = k, l[r[k]] = idx, r[k] = idx, idx++;
}

void remove(int k)
{
    l[r[k]] = l[k]; // 右边的左边等于左边
    r[l[k]] = r[k]; // 左边的右边等于右边
}

int main ()
{
    int m ;
    cin>>m;

    init();// 一定一定要初始化，不然会变得不幸

    while(m --)
    {
        int k, x;
        string op;

        cin>>op;

        if( op == "L")
        {
            cin>>x;
            insert(0, x);
        }
        else if( op == "R")
        {
            cin>>x;
            insert(l[1], x);
        }
        else if( op == "D")
        {
            cin>>k;
            remove(k + 1);
        }
        else if( op == "IL")
        {
            cin>>k>>x;
            insert(l[k + 1], x);
        }
        else
        {
            cin>>k>>x;
            insert(k + 1, x);
        }
    }

    for(int i = r[0]; i != 1; i = r[i]) cout<<e[i]<<" ";
    cout<<endl;

    return 0;
}
```

### 栈

#### 基础模板

##### 数组模拟栈

```none
#include <iostream>
#include <string>
using namespace std;

const int N = 1e5 + 10;
int stk[N],tt;

void init_stk()
{
    tt = -1;
}

int main()
{
    int m ;
    cin>>m;

    init_stk();

    while( m --)
    {
        int x;
        string op ;

        cin>>op;

        if(op == "push")
        {
            cin>>x;
            stk[++ tt] = x; 
        }
        else if(op == "query")
        {
            cout<<stk[tt]<<endl;
        }
        else if(op == "pop")
        {
            tt--;
        }
        else if(op == "empty")
        {
            if( tt >= 0 ) cout<<"NO"<<endl;
            else cout<<"YES"<<endl;
        }
    }


    return 0;
}
```

#### 单调栈

总体过程：定义一个栈，遍历数组

- 

  当栈顶元素 >= 当前元素 ， 弹出栈顶元素

- 

  流程结束之后当前的栈顶元素就是最近的小于等于当前元素的元素。

原理：***确保栈内元素递增\***。
代码模板

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int stk[N] , tt;

int main ()
{
    cin.tie(NULL);
    ios_base::sync_with_stdio(false);
    int n;
    cin>>n;
    
    for(int i = 0 ; i < n ; i++) 
    {
        int x ;
        cin>>x;
        while( tt && stk[tt] >= x) tt--;
        
        if(stk[tt]) cout<<stk[tt]<<' ';
        else cout<<"-1 ";
        
        stk[++tt] = x; // 记得入栈
    }
    
    return 0;
}
```

##### 应用

1. 找到一个数的左边离它最近的数 -- yxc ：基本上就这个应用

#### 单调队列

代码模板

这里是求滑动窗口中的`最小值 | 最大值`

```none
#include <iostream>
using namespace std;

const int N = 1e6 + 10;
int a[N], q[N];//使用数组模拟队列

int main()
{
    cin.tie(NULL);
    ios_base::sync_with_stdio(false);
    int n , k;
    cin>>n>>k;
    
    for(int i = 0; i < n ;i ++) cin>>a[i];
    
    int hh = 0 , tt = -1; // hh 为队头， tt 为队尾
    
    for(int i = 0; i < n ;i ++)
    {
        // 判断队列有没在滑动窗口之内
        if( hh <= tt && i - k + 1 > q[hh] )  hh++;
        
        while( hh <= tt && a[q[tt]] >= a[i]) tt--; // 比它大的都弹出
        
        q[ ++tt ] = i; // 队列里面存储的是下标
        
        if( i >= k - 1 ) cout<<a[q[hh]]<<" ";
        
    }
    
    cout<<endl;
    
    hh = 0 , tt = -1; // hh 为队头， tt 为队尾
    
    for(int i = 0; i < n ;i ++)
    {
        // 判断队列有没在滑动窗口之内
        if( hh <= tt && i - k + 1 > q[hh] )  hh++;
        
        while( hh <= tt && a[q[tt]] <= a[i]) tt--; // 比它小的都弹出
        
        q[ ++tt ] = i; // 队列里面存储的是下标
        // 初始的时候，要有窗口长度再输出
        if( i >= k - 1 ) cout<<a[q[hh]]<<" ";
        
    }
    return 0;
}
```

## KMP

本质上就是充分利用在匹配过程中能够得到的信息，来进行下一次的匹配。

- 

  这里使用

  ne数组

   

  来保存在当前长度下，字符串最长相等前后缀的长度。

- 

  在匹配的过程中，如果模板已经匹配到了 j 的位置， 那么从 j 之前的位置肯定是已经匹配过了。

  如果说 之前有 ne[j] 这个位置的左右对称长度的字符串长度是相等的（也就是前后缀相等

  那么我们可以直接让 j 从 ne[j] 的位置开始匹配，因为 ne[j] 的最长前后缀是相等的，且ne[j] 是在 j 之前， 也就是已经匹配过了， 所以就可以确定

  ```
  ne[ j ]
  ```

  前面的部分和原字符串是相等的

经过上面的步骤 ， 也就节省调了 ne[ j ] 代表的那一部分的距离，也就达到了优化字符串匹配的效果，这个就是kmp算法。

比较简洁的算法模板

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
const int M = 1e6 + 10;

char p[N] , s[M];
int n , m;
int ne[N]; //这里不用next 是因为iterator 中也定义了next()这个方法，防止冲突

int main()
{
    // cin.tie(NULL);
    // ios_base::sync_with_stdio(false);

    cin>> n >> (p+1) >> m >> (s + 1); // 这里在输入数组的时候就已经让下标从1开始了

    //求next数组
    for( int i = 2 , j = 0 ; i <= n; i++)
    {
        while( j && p[i] != p[j + 1]) j = ne[j];// 如果还能退 | 不相等 =》 退到可以相等的位置
        if( p[i] == p[j + 1] ) j ++;
        ne[i] = j;
    }

    for( int i = 1 ,j = 0 ; i <= m; i++)
    {
        while( j && s[i] != p[j + 1]) j = ne[j];
        if( s[i] == p[j + 1]) j ++;
        if( j == n)
        {
            cout<< i - n<<" ";
            j = ne[j];
        }
    }

    return 0;
}
```

## Trie( 字典树)

模板

```java
import java.util.* ;

public class Main{
    private static int N  = 100010;
    private static int[][] son = new int[N][26];
    private static int[] cnt = new int[N];
    private static int idx = 1;
    
    private static void insert( char[] str ){
        int p = 0;
        for( int i = 0 ; i < str.length ; i++)
        {
            int u = str[i] - 'a';
            if( son[p][u] == 0 ) son[p][u] = ++idx;
            p = son[p][u];
        }
        
        cnt[p]++;
    }
    
    private static int query(char[] str){
        int p = 0;
        
        for(int i = 0 ; i < str.length ; i++)
        {
            int u = str[i] - 'a';
            if( son[p][u] == 0 ) return 0;
            p = son[p][u];
        }
        
        return cnt[p];
    }
    
    
    public static void main(String [] argvs){
        Scanner sc = new Scanner( System.in );
        
        int n = sc.nextInt();
        
        String op;
        String str;
        while( n-- > 0 )
        {
            op = sc.next();
            str = sc.next();
            
            if( "I".equals(op) ) insert(str.toCharArray());
            else System.out.println(query(str.toCharArray()));
        }
        
    }
}
```

- 

  java的输入输出对acm模式还是不太友好，好麻烦。

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int son[N][26] , cnt[N], idx;
char str[N];

void insert( char *str)
{
    int p = 0;
    for( int i = 0; str[i] ; i++){
        int u  = str[i] - 'a';
        if( ! son[p][u] ) son[p][u] = ++idx; // 没有的话就创建
        p = son[p][u];
    }
    cnt[p] ++; // 这个单词的数量
}

int serach(char str[])
{
    int p = 0; // 这里的p和idx配合，起到一个唯一标识的作用，标识树中的一个节点。
    for( int i = 0 ; str[i] ; i++)
    {
        int u = str[i] - 'a';
        if( !son[p][u] ) return 0;
        p = son[p][u];
    }
    return cnt[p];
}

int main ()
{
    int m;
    cin>>m;

    
    while( m --)
    {
        char op[2];
        scanf("%s%s", op , str);
        
        if(*op == 'I') insert(str);
        else cout<<serach(str)<<endl;
    }
    
    return 0;
}
```

## 并查集

### 主要操作

1. 将两个集合合并
2. 询问两个元素是否在一个集合中

可以在**近乎** `O(1)` 的时间复杂度之内完成两个操作

### 基本原理

每一个集合用一棵树来表示。树根的编号就是整个集合的编号。每个节点存储它的父节点，`p[x]`表示x的父节点

1. 如何判断树根 ： `if (p[x] == x)`
2. 如何求x的集合编号： `while( p[x] != x) x = p[x]`
3. 如何合并两个集合 : px 是 x 的集合编号 ， py 是 y 的集合编号 `p[x] = y` 。

#### 优化

**路径压缩**： 搜索过程中，将中间所有节点都指向根节点。

java模板（裸板）

```java
import java.util.*;

public class Main{
    private static int N = 100010;
    private static int [] p = new int[N];
    
    private static int find(int x ){
        if( p[x] != x ) return p[x] = find(p[x]);
        return p[x];
    }
    
    public static void main(String [] argvs){
        Scanner sc = new Scanner( System.in );
        int n = sc.nextInt(), m = sc.nextInt();
        
        for(int i = 0 ; i < n ;i++) p[i] = i;
        
        while( m -- > 0)
        {
	        //输入输出确实麻烦
            String op = sc.next();
            int a = sc.nextInt();
            int b = sc.nextInt();
            
            if( "M".equals(op) ) p[find(a)] = find(b);
            else {
                if( find(a) == find(b) ) System.out.println("Yes");
                else System.out.println("No");
            } 
        }
    }
}
```

C++模板

```none
#include <iostream>
using namespace std;

const int N = 1e5 + 10;

int p[N];

//核心
int find( int x ){ 
    if( p[x] != x)
    {
        return p[x] = find(p[x]); // 这里的赋值就是路径压缩
    }
    return p[x];
}

int main (){
    
    int n , m;
    cin>>n>>m;
    
    for(int i = 0 ; i <  n; i++) p[i] = i;
    
    while( m --)
    {
        char op[2];
        int a, b;
        cin>>op>>a>>b;
        
        if( op[0] == 'M' ) p[find(a)] = find(b); 
        else {
            if( find(a) == find(b)) puts("Yes");
            else puts("No");
        }
    }
    
    return 0;
}
```

### 拓展

#### 连通块

"Pasted image 20221104105152.png" 未创建，点击以创建。

使用一个`size[N]`来维护连通块中元素的数量，在每次合并的时候就将集合中元素的数量也合并。

```java
import java.util.*;

public class Main{
    
    private static int N = 100010;
    private static int[] p = new int [N];
    private static int[] size = new int [N]; //维护这个题目需要的连通块中元素的数量
    
    //并查集的核心
    private static int find( int x ){
        if( p[x] != x ) return p[x] = find( p[x] );
        return p[x];
    }
    
    public static void main (String [] argvs){
        Scanner sc = new Scanner( System.in );
        
        int n = sc.nextInt() , m = sc.nextInt();
        
        for(int i = 0 ; i < n ; i ++) 
        {
            p[i] = i;
            size[i] = 1;
        }
        
        while( m -- > 0)
        {
            String op = sc.next();

            
            if( "C".equals(op)) {
                int a =  sc.nextInt() , b = sc.nextInt();
                
                if( find(a) == find(b)) continue;
                
                size[find(b)] += size[find(a)]; // 这里要注意合并之后的状态 , 是a并入b，而不是反过来
                p[find(a)] = find(b);
            
            }else if( "Q1".equals(op) ){
                int a =  sc.nextInt() , b = sc.nextInt();
                
                if( find(a) == find(b) ) System.out.println("Yes");
                
                else System.out.println("No");
            }else{
                int a = sc.nextInt();
                
                System.out.println(size[find(a)]);
            }
        }
        
    }
}
#include <iostream>
using namespace std;

const int N = 100010;
int p[N],cnt[N];

int find(int x)
{
    if( p[x] == x ) return p[x];
    else return p[x] = find(p[x]);
}

int main(){
    
    int n , m;
    cin>>n>>m;
    for(int i = 1; i <= n; i++) p[i] = i, cnt[i] = 1;
    
    while( m -- > 0)
    {
        string op;
        int a, b;
        
        cin>>op;
        
        if( op == "C") 
        {
            cin>>a>>b;
            a = find(a), b = find(b);
            if(a != b) // 还要考虑是同一个点的情况
            {
                p[a] = b;
                cnt[b] += cnt[a];
            }
        }
        else if( op == "Q1") 
        {
            cin>>a>>b;
            if( find(a) == find(b) ) cout<<"Yes"<<endl;
            else cout<<"No"<<endl;
        }
        else {
            cin>>a;
            cout<<cnt[find(a)]<<endl;
        }
    }
    
    return 0;
}
```

## 堆

### 如何手写一个堆

一个堆需要满足的操作：

1. 插入一个数
2. 求集合中的最小值
3. 删除最小值
4. 删除任意一个元素
5. 修改任意一个元素
   "Pasted image 20221104113231.png" 未创建，点击以创建。
   堆的**性质**：

- 

  堆是一颗

  完全二叉树

  "Pasted image 20221104112016.png" 未创建，点击以创建。

- 

  小根堆的定义：每一个节点都比左右两个子节点更小 => 根节点最小

堆的**存储**：

1. 使用一维数组进行存储
   左儿子：`2 * x`
   右儿子：`2 * x + 1`

基础操作：

1. `down(x)`
2. `up(x)`
   所有的其它操作都可以通过这两个操作的组合来完成

```java
import java.util.*;

public class Main{
    
    private static int N = 100010;
    private static int [] heap = new int [N];
    private static int size;
    
    private static void down( int u ){
        int t  = u;
        if( u * 2 <= size && heap[u * 2] < heap[t]) t = u * 2;
        if( u * 2 + 1 <= size && heap[u * 2 + 1] < heap[t]) t = u * 2 + 1;
        
        if( u != t)
        {
            int tmp = heap[u];
            heap[u] = heap[t];
            heap[t] = tmp;
            
            down(t);
        }
    }
    
    private static void up ( int u ){
        while( heap[u/2] < heap[u] ){
            u = u / 2;
        }
    }
    
    public static void main (String [] argvs){
        Scanner sc = new Scanner( System.in );
        
        int n = sc.nextInt(), m = sc.nextInt();
        
        for(int i = 1 ; i <= n ; i++) heap[i] = sc.nextInt();
        size = n;
        
        for(int i = n / 2 ; i > 0 ; i --) down(i); // 建堆
        
        while( m-- > 0)
        {
            System.out.printf("%d ", heap[1]);
            heap[1] = heap[size --];
            down(1);
        }
        
    }
}
#include <iostream>
using namespace std;

const int N = 1e5 + 10;
int heap[N], cnt;

void down(int u ){
    int t = u;
    
    if( u * 2 <= cnt && heap[u * 2] < heap[t] ) t = u * 2;
    if( u * 2 + 1 <= cnt && heap[u * 2 + 1] < heap[t] ) t = u * 2 + 1;
    
    if( u != t)
    {
        swap(heap[u] , heap[t]);
        down(t);
    }
}

int main ()
{
    int n , m ;
    cin>>n>>m;
    
    for(int i = 1 ; i <= n ;i++) cin>>heap[i];
    cnt = n;
    
    for(int i = n/2; i ; i -- ) down(i);
    
    while ( m --){
        
        cout<<heap[1]<<" ";
        heap[1] = heap[cnt --];
        down(1);
    }    
    
    return 0;
}
```

完整实现

核心就是加上了 `ph | hp`这两个数组，用来映射插入顺序和在堆中的顺序，两个数组是互相映射的关系。

```none
#include <iostream>
#include <algorithm>
#include <string.h>

using namespace std;

const int N = 100010;

int h[N], ph[N], hp[N], cnt;

void heap_swap(int a, int b) // 和java不同点就在这里
{
    swap(ph[hp[a]],ph[hp[b]]);
    swap(hp[a], hp[b]);
    swap(h[a], h[b]);
}

void down(int u)
{
    int t = u;
    if (u * 2 <= cnt && h[u * 2] < h[t]) t = u * 2;
    if (u * 2 + 1 <= cnt && h[u * 2 + 1] < h[t]) t = u * 2 + 1;
    if (u != t)
    {
        heap_swap(u, t);
        down(t);
    }
}

void up(int u)
{
    while (u / 2 && h[u] < h[u / 2])
    {
        heap_swap(u, u / 2);
        u >>= 1;
    }
}

int main()
{
    int n, m = 0;
    scanf("%d", &n);
    while (n -- )
    {
        char op[5];
        int k, x;
        scanf("%s", op);
        if (!strcmp(op, "I"))
        {
            scanf("%d", &x);
            cnt ++ ;
            m ++ ;
            ph[m] = cnt, hp[cnt] = m;
            h[cnt] = x;
            up(cnt);
        }
        else if (!strcmp(op, "PM")) printf("%d\n", h[1]);
        else if (!strcmp(op, "DM"))
        {
            heap_swap(1, cnt);
            cnt -- ;
            down(1);
        }
        else if (!strcmp(op, "D"))
        {
            scanf("%d", &k);
            k = ph[k];
            heap_swap(k, cnt);
            cnt -- ;
            up(k);
            down(k);
        }
        else
        {
            scanf("%d%d", &k, &x);
            k = ph[k];
            h[k] = x;
            up(k);
            down(k);
        }
    }

    return 0;
}
/*
I x，插入一个数 x；h[++size] = x;up(size);
PM，输出当前集合中的最小值； h[1]
DM，删除当前集合中的最小值（数据保证此时的最小值唯一）； h[1] = h[size--];down(1);
D k，删除第 k 个插入的数； h[k] = h[size--];down(k),up(k)
C k x，修改第 k 个插入的数，将其变为 x；h[k] = x,down(k) ,up(k);
*/
import java.util.Scanner;
public class Main{
    static int N = 100010,size,m;
    static int[] h = new int[N];
    static int[] hp = new int[N];//自身被映射数组
    static int[] ph = new int[N];//映射数组
    public static void swap(int[] a,int x,int y){
        int temp = a[x];
        a[x] = a[y];
        a[y] = temp;
    }
    public static void head_swap(int x,int y){
        //这里因为映射数组跟被映射数组是互相指向对方,如果有两个数更换位置，映射下标也要进行更换
        //ph的下标指向是按顺序插入的下标，hp所对应的值是ph的按顺序的下标，用这两个属性进行交换
        swap(ph,hp[x],hp[y]);
        //因为按照顺序插入ph到指向交换了，对应指向ph的hp也要进行交换
        swap(hp,x,y);
        //最后两个值进行交换
        swap(h,x,y);
    }
    public static void down(int x){
        int t = x;//x的分身
        //判断一下左下标是不是存在
        //判断一下左下标的值是不是比我t的值小 。那么就将左下标的值赋予t；否则不变
        if(x * 2 <= size && h[x * 2] < h[t]) t = x * 2;
        //判断一下右下标的值是不是比我t的值小。那么就将右下标的值赋予t，否则不变
        if(x *2 + 1 <= size && h[x * 2 + 1] < h[t]) t = x * 2 + 1;
        if(t != x){//如果x不等于他的分身
            head_swap(x,t);//那就进行交换顺序
            down(t);//然后一直向下进行操作
        }
    }
    public static void up(int x){
        //向上操作，判断一下根节点还不是存在
        //看一下根节点是不是比我左分支或者右分支的值大，大的话就进行交换
        while(x / 2 > 0 && h[x / 2] > h[x]){
            head_swap(x,x/2);
            x = x / 2;//相当于一直up
        }
    }
    public static void main(String[] args){
        Scanner scan = new Scanner(System.in);
        int n = scan.nextInt();
        size = 0;//size是原数组的下标
        m = 0;//m是映射数组的下标
        while(n -- > 0){
            String s = scan.next();
            if(s.equals("I")){//插入操作
                int x= scan.nextInt();
                size ++;m ++;//插入一个数两个数组的下标都加上1；
                ph[m] = size;hp[size] = m;//ph与hp数组是映射关系
                h[size] = x;//将数插入到堆中最后位置
                up(size);//然后up，往上面排序一遍
            }else if(s.equals("PM")){ //输出当前集合中的最小值
                System.out.println(h[1]);
            }else if(s.equals("DM")){//删除当前集合中的最小值
                //因为需要用到映射数组与被映射数组,因为需要找到k的位置在哪里，需要让映射的顺序，
                //因为如果用size，size是会随时改变的，不是按顺序的，因为会被up或者down顺序会被修改
                head_swap(1,size);//将最后一个数替换掉第一个最小值元素，然后数量减1，size--
                size--;
                down(1);//插入之后进行向下操作，因为可能不符合小根堆
            }else if(s.equals("D")){//删除当前集合中第k个插入得数
                int k = scan.nextInt();
                k = ph[k];//ph[k] 是一步一步插入映射的下标，不会乱序，
                head_swap(k,size);//然后将k与最后一个元素进行交换，然后长度减1，size--
                size--;
                up(k);//进行排序一遍，为了省代码量，up一遍down一遍。因为只会执行其中一个
                down(k);
            }else{
                int k = scan.nextInt();
                int x = scan.nextInt();
                k = ph[k];//ph[k] 是一步一步插入映射的下标，顺序是按照插入时候的顺序
                h[k] = x;//然后将第k为数修改为数x
                up(k);//up一遍，down一遍
                down(k);

            }
        }
    }
}
```

## HASH 表和 STL简介

### 哈希表

> 知识点：

```
- 存储结构 
	- 开放寻址法
	- 拉链法
- 字符串哈希方式
```

#### 哈希表的主要作用

把一个比较大的数据范围映射到一个更小的数据范围（广义的离散化）, 同时可以获得更快的查询速度。
通过一个hash函数将一个大值映射到一个小值。

一般是通过取模一个**质数**来得到小的数。
处理冲突的两种方式

1. 拉链法
   也就是每一个位置都是一个**链表**，当冲突时，就将它添加到链表末尾。
2. 开放寻址法

一般是通过打上一个标记的方式来完成删除的功能。

- 

  拉链法

```none
#include <iostream>
#include <cstring>
using namespace std;

const int N = 100003;
int h[N], e[N], ne[N], idx;//这里是用链表辅助来处理冲突


void insert( int x ){
    int k = (x % N + N) % N;//避免负数的情况
    e[idx] = x;
    ne[idx] = h[k]; // 插入到链表头部
    h[k] = idx++;
}

bool find( int x)
{
    int k = (x % N + N) % N;
    for(int i = h[k]; i != -1; i = ne[i]) // 从尾部往头部找
    {
        if( e[i] == x) return true;   
    }
    
    return false;
}

int main ()
{
    int n ;
    scanf("%d", &n);
    
    memset(h , -1 , sizeof h);
    
    while( n-- > 0)
    {
        char op[2];
        int x ;
        scanf("%s%d", op, &x);
        
        if( *op == 'I')
        {
            insert(x);
        }else {
            if( find(x) ) puts("Yes");
            else puts("No");
        }
        
    }
    
    
    return 0;
}
import java.io.*;  
import java.util.*;

public class Main{
	static int N = 100003;
	static int [] h = new int[N];
	static int [] e = new int[N];
	static int [] ne = new int[N];
	static int idx = 0;

	static void insert(int x )
	{
	    int k = (x % N + N) % N;

	    e[idx] = x;
	    ne[idx] = h[k];
	    h[k] = idx++;
	}

	static boolean find(int x)
	{
	    int k = (x % N + N) % N;
	
	    for(int i = h[k] ; i != -1 ; i = ne[i])
	    {
	        if( e[i] == x ) return true;  
	    }
	
	    return false;
	}


	public static void main(String [] argvs) throws IOException
	{
	    BufferedReader reader = new BufferedReader( new InputStreamReader( System.in ));
	    Arrays.fill(h, -1);
	
	    int n = Integer.parseInt(reader.readLine());

	    while( n -- > 0)
	    {
	        String[] strs = reader.readLine().split(" ");
	        String op = strs[0];
	        int x = Integer.parseInt(strs[1]);
	
	        if( op.equals("I"))
	        {
	            insert(x);
	        }else {
	            if( find(x) ) System.out.println("Yes");
	            else System.out.println("No");
	        }
	    }
	}
}
```

- 

  开放寻址法
  只用一个数组来进行存储，形式上会更为简单

  一般情况下数组的长度是数据量的**两到三倍**。

```java
import java.io.*;
import java.util.*;

public class Main{
    
    static int N = 200003;
    static int never = 0x3f3f3f3f;
    static int[] h = new int[N];
    
    static int find(int x) // 返回在 hash数组中的下标
    {
        int k = (x % N + N) % N;
        
        while( h[k] != never && h[k] != x) // 在数组中轮流查找
        {
            k++;
            if( k == N) k = 0;
        }
        return k;
    }
    
    
    public static void main(String [] argvs) throws IOException
    {
        BufferedReader reader = new BufferedReader( new InputStreamReader( System.in ));
        Arrays.fill(h, never);
        
        int n = Integer.parseInt(reader.readLine());
        
        while( n -- > 0)
        {
            String[] strs = reader.readLine().split(" ");
            String op = strs[0];
            int x = Integer.parseInt(strs[1]);
            
            if( op.equals("I"))
            {
                h[find(x)] = x;
            }else {
                if( h[find(x)] == x) System.out.println("Yes");
                else System.out.println("No");
            }
        }
    }
}
```

#### 字符串哈希

将字符串看成是**p进制的数**进行转换，然后对它的十进制数取模
p的值为 `131 或者 1331 `， 这个是经验值。
我们在进行转换的时候，**排除0**这个值，默认不会冲突。

作用：

- 

  快速判断两个字符串段是否相同，时间复杂度

   

  ```
  O(1)
  ```

   

  ， 在大多数字符串场景要比KMP优秀

```none
#include <iostream>
using namespace std;

typedef unsigned long long ULL; // 用unsigned 类型的数据， 在溢出的时候会自动取模

const int N  = 100010;
ULL h[N];//代表字符串的前缀和
ULL p[N];//代表p进制
const int P = 131; // 也可以是 13331，这两个数不容易冲突

ULL query(int l , int r)
{
    return h[r] - h[l-1] * p[r - l + 1];
}

int main()
{
    int n , m;
    char str[N];
    scanf("%d%d%s", &n ,& m, str + 1);
    
    p[0] = 1; // 避免冲突
    for(int i = 1 ; i <= n;i++)
    {
        h[i] = h[i-1] * P + str[i];
        p[i] = p[i - 1] * P;
    }
    
    while ( m --)
    {
        int l1,r1,l2,r2;
        scanf("%d%d%d%d", &l1,&r1,&l2,&r2);
        
        if( query(l1, r1) == query(l2, r2)) puts("Yes");
        else puts("No");
    }
    
    return 0;
}
```

### STL介绍

```none
vector ，变长数组，倍增的思想 , 支持迭代器
	size()
	empty()
	clear()
	front()/ back()
	push_back()/ pop_back()
	begin() / end()
	支持比较运算，比较基准是字典序
pair<type, type> 存储一个二元组
	p.first | p.second 
	支持比较运算， 以 first 为第一关键字 ， 以 second 为第二关键字
	make_pair()
	{first, second}
string ， 字符串, substr(), c_str()
	size()
	empty()
	clear()
	支持 + 运算
	substr(start , size); 当size > string.size() , 截取到末尾 
queue    队列 push() front() pop()
	size()  
	push()  // 向队尾插入一个元素
	front() // 返回队头元素 
	back() // 返回队尾元素
	pop() // 弹出队头元素
priority_queue 优先队列  , 实现原理是堆 , 默认是大根堆
	push() //插入一个元素
	top()  // 返回堆顶元素
	pop() // 弹出堆顶元素
	priority_queue<int ,vector<int>, greater<int>> heap; //这样就定义了一个小根堆
stack 栈
	push()
	top()
	pop()
deque 双端队列（一个加强版的 vector）
	size()
	empty()
	clear()
	front()
	back()
	push_back()/pop_back()
	push_front()/pop_front()
	begin()/ end()
set,map, multiset, multimap 基于平衡二叉树 ， 动态维护有序序列
	size()
	empty()
	clear()
	begin()/ end() ++ --返回前驱和后继
	
	set/multiset 
		insert() 插入一个数 O(log n )
		find() 
		count()
		erase()
			输入一个数x，删除所有x O(K + log n)
			输入一个迭代器，删除这个迭代器
		lower_bound()/ upper_bound() 
			lower_bound(x) 返回大于等于x的最小的数的迭代器 | 最小下界
			uppper_bound(x) 返回大于x的最小的数的迭代器 | 最大上界
	map/mutimap
		insert() 插入的一个数是pair
		erase() 输入的参数是pair 或 迭代器
		find()
		[] 时间复杂度是 O(logn)
		lower_bound()/ upper_bound() 
		
unordered_set, unordered_map, unordered_multiset, unordered_multimap 哈希表
	和上面类似，绝大部分操作的时间复杂度都是 O(1)
	不支持lower_bound() / upper_bound()
	不支持迭代器的++ -- 
bitset ， 压位
	当我们存储 bool 数组的时候,占用的内存是正常数组的 1/8 
	bitset<size> s;
	~ , & , | , ^ 
	>> , <<
	== , !=
	[]
	count() 返回有多少个1
	any() 判断是否至少有1个1
	none() 判断是否全为 0 
	set() 把所有位置设为1
	set(k, v) 将第k位变为0
	flip(k) 将第k位 取反
	flip <=> ~
```

# 搜索与图论

## DFS | BFS | 树与图的存储 | 拓扑排序

### DFS

全排列

```java
import java.util.*;

public class Main{
    static int N = 10, n;
    static int [] path = new int [N];
    static boolean [] st = new boolean[N];
    
    static void dfs(int u)
    {
        if( u == n)
        {
            for(int i = 0 ; i < n; i++)
            {
                System.out.printf("%d ", path[i]);
            }
            System.out.printf("\n");
        }
        // 每一个数字都遍历到， 不同高度的树主要通过 st[i] 来区分
        for(int i = 1; i <= n ;i++)
        {
            if( !st[i] )
            {
                st[i] = true;
                path[u] = i;
                dfs(u + 1);
                st[i] = false;
            }
        }
    }
    
    public static void main(String [] argvs)
    {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        dfs(0);
    }
}
```

N皇后

```java
import java.util.*;

public class Main{
    
    static int N = 20;
    static boolean [] col = new boolean [N] , dg = new boolean [N] , udg = new boolean [N];
    static int n ;
    static char [][] g = new char [N][N];
    
    static void dfs(int u) // 按行搜索
    {
        if( u == n ) // 搜索到最后一行，输出
        {
            for(int i = 0 ; i < n ; i++) 
            {
                for(int j = 0 ; j < n; j++)
                    System.out.print(g[i][j]);
                System.out.println();
            }
                
            System.out.println();
            return ;
        }
        
        for(int i = 0 ;i < n; i++) // 搜索一行的每个位置
        {
            if( !col[i] && !dg[u + i] && !udg[i - u + n]) // 剪枝
            {
                g[u][i] = 'Q';
                col[i] =  dg[u + i] = udg[i - u + n] = true;
                
                dfs( u + 1 );
                //回溯
                col[i] =  dg[u + i] = udg[i - u + n] = false;
                g[u][i] = '.';
            }
        }
    }
    
    public static void main(String [] argvs)
    {
        Scanner sc = new Scanner(System.in);
        
        n = sc.nextInt();
        
        for(int i = 0 ; i < n; i++) // 初始化棋盘
            for(int j = 0; j < n;j++)
                g[i][j] = '.';
        
        dfs(0);
        
    }
}
```

图解过程：

Pasted image 20221107210235.png





### BFS

走迷宫

```none
#include <iostream>
#include <cstring>
using namespace std;


typedef pair<int , int > PII;

const int N = 110;
int n , m;
PII q[N * N];
int d[N][N],g[N][N];

int bfs(){
    int hh = 0  , tt = 0;
    q[0] = {0 , 0};
    memset(d, -1, sizeof d);

    d[0][0] = 0;

    int dx[4] = {0, -1, 1, 0};
    int dy[4] = {1, 0, 0, -1};


    while( hh <= tt)
    {
        auto node = q[hh++];

        for(int i = 0 ; i < 4; i++)
        {
            int x = node.first + dx[i], y = node.second + dy[i];

            if( x >= 0 && x < n && y >= 0 && y < m && d[x][y] == -1 && g[x][y] == 0)// 在范围内，且没来过
            {
                d[x][y] = d[node.first][node.second] + 1;
                q[++tt] = {x, y};
            }
        }
    }

    return d[n - 1][m - 1];
}


int main ()
{
    cin>>n>>m;

    for(int i = 0 ; i < n; i++)
        for(int j = 0; j < m ;j ++)
            cin>>g[i][j];

    cout<<bfs()<<endl;

    return 0;
}
```

### 树和图的存储

1. 树 ， 树就是无环连通图

2. 

   图

   存储方式：

   1. 领接矩阵
   2. 邻接表 --- -> 链式前向星（数组形式）

树的重心

```none
#include <iostream>
#include <algorithm>
#include <cstring>
using namespace std;

const int N = 100010;
const int M = N * 2;
int h[N], e[M], ne[M], idx;
int n , ans = N ;
bool st[N];

void add (int a , int b)
{
    e[idx] = b; ne[idx] = h[a]; h[a] = idx; idx++;
}

int dfs( int u )
{
    st[u] = true;
    int res = 0; // 删除某个节点之后，最大的连通子图节点数
    int sum = 1; // 以 u 为根的树的节点数，包括u本身
    // 访问 u 的每一个子节点
    for(int i = h[u] ; i != -1 ; i = ne[i])
    {
        int j = e[i]; // 取到节点
        if( !st[j] )
        {
            int s = dfs(j); // 子树节点数
            res = max(res, s); // 最大连通子图的节点数
            sum += s;// 以j 为根的树的节点数
        }
    }
    
    res = max( res ,n - sum); // 选择以u节点为重心的，最大的 连接子图节点数
    ans = min( res , ans); // 遍历过的假设重心中，最小的 最大连通子图的节点数
    return sum ; // 返回这个子树的包含的节点个数
}

int main()
{
    cin>>n;
    
    memset(h , -1, sizeof h);
    
    int a, b;
    for(int i = 0 ; i < n ;i ++)
    {
        cin>>a>>b;
        add(a,b), add(b,a);
    }
    
    dfs(1);
    
    cout<<ans<<endl;
    
    return 0;
}
```

图的层次（bfs）

```none
#include <iostream>
#include <algorithm>
#include <cstring>
using namespace std;

const int N = 100010;
const int M = N * 2;// 无向图有两条边
int h[N] , e[M] , ne[M], idx;
int d[N] , q[N];// 分别表示层次 、 队列
int n , m;

void add( int a, int b)
{
    e[idx] = b , ne[idx] = h[a], h[a] = idx++;
}

int bfs()
{
    int hh = 0 , tt =0;
    q[0] = 1;
    
    memset(d, -1, sizeof d);
    
    d[1] = 0;
    
    while( hh <= tt)
    {
        int t = q[hh++];
        for(int i = h[t] ; i != -1; i = ne[i])
        {
            int j = e[i];
            if( d[j] == -1)
            {
                d[j] = d[t] + 1;
                q[++tt] = j;    
            }
        }
    }
    
    return d[n];
}


int main()
{
    cin>>n>>m;
    
    memset(h, -1 ,sizeof h);
    
    int a, b;
    for(int i = 0 ;i < m ;i++)
    {
        cin>>a>>b;
        add(a , b);
    }
    

    
    cout<<bfs()<<endl;
    
    return 0;
}
```

拓扑排序

```none
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

const int N = 100010;
const int M = 2 * N;
int h[N], e[M], ne[M] , idx;
int q[N], d[N]; // 这里的d数组代表入度
int n , m ;

void add( int a , int b)
{
    e[idx] = b;
    ne[idx] = h[a];
    h[a] = idx++;
}

bool top(){
    int hh = 0, tt = -1;
    
    
    //记得先将所有入度为0的点加入队列 | 注意遍历的是点， 下标从1开始
    for(int i = 1 ;i <= n; i++)
        if( d[i] == 0)
            q[++ tt] = i;
    
    while( hh <= tt)
    {
        int t = q[hh++];
        for(int i = h[t]; i != -1 ; i = ne[i])
        {
            int j = e[i];
            d[j]--;
            if( d[j] == 0)
            {
                q[++tt] = j;
            }
        }
    }
    
    return tt == n - 1;// 这里是因为 tt 的初始值是 -1
}


int main()
{
    cin>>n>>m;
    
    memset(h , -1, sizeof h);
    
    int a, b;
    for(int i = 0 ; i < m ;i++)
    {
        cin>>a>>b;
        add(a,b);
        d[b]++;
    }
    
    if( top() )
    {
        for(int i = 0 ;i < n ;i ++) 
            cout<<q[i]<<" ";
    }
    else puts("-1");
    
    return 0;
}
```

八数码

- 

  核心在于状态的抽象

- 

  转移的实现也是需要注意的点--->数学转换

```none
#include <iostream>
#include <queue>
#include <unordered_map>

using namespace std;

int bfs(string start)
{
    queue<string> q ;
    unordered_map<string, int> d;
    
    q.push(start);
    d[start] = 0;
    
    int dx[4] = { 0 , -1, 1, 0}, dy[4] = {1 , 0 , 0, -1};
    
    string end = "12345678x";
    while( q.size() )
    {
        auto t = q.front();
        q.pop();
        
        if( t == end ) return d[t];
        
        int k = t.find('x');
        int x = k / 3 , y = k % 3;
        
        int distance = d[t];
        
        for(int i = 0 ; i < 4 ; i++)
        {
            int a = x + dx[i] , b = y + dy[i];
            if( a >= 0 && a < 3 && b >= 0 && b < 3)
            {
                swap(t[a * 3 + b] , t[k]);
                
                if( !d.count(t) )
                {
                    d[t] = distance + 1;
                    q.push(t);
                }
                
                swap(t[a * 3 + b], t[k]);
            }
        }
    }
    
    return -1;
    
}

int main ()
{
    string start;
    for(int i = 0 ; i < 9 ; i++)
    {
        char a;
        cin>>a;
        start += a;
    }
    
    cout<<bfs(start)<<endl;
    
    return 0;
}
```

## 最短路

### 概览

一般分为两大类
`n 为点数 m 为边数`

- 

  

  单源最短路

  - 

    

    所有边权为正

    - 

      朴素dijkstra 算法( O(n^2) ) --

       

      稠密图

    - 

      堆优化的 dijkstra 算法( m * logn ) --

       

      稀疏图

  - 

    

    有边权为负

    - 

      Bellman-Ford ( O( nm ) )

    - 

      spfa 最坏 ( O(nm ) ) 一般（ O(m) ）

- 

  多源汇最短路

  \- Floyd ( O(n ^ 3) )

  难点

  ： 从实际问题中

  抽象

  出最短路的模型。

### dijkstra

#### 朴素dijkstra

稠密图 ---> 使用邻接矩阵存储

```none
#include <iostream>
#include <cstring>
using namespace std;

const int N = 510;
int g[N][N], dist[N], n, m;
bool st[N];

int dijkstra()
{
    memset(dist, 0x3f , sizeof dist);
    dist[1] = 0;
    
    for(int i = 1; i <= n ; i ++)
    {
        //找到最小未确定距离的点
        int t = -1;
        for(int j = 1; j <= n ;j++)
        {
            if( !st[j] && ( t == -1 || dist[t] > dist[j]) )
                t = j;
        }
        // 用最小的点更新距离
        for(int j = 1; j <= n ; j++)
            dist[j] = min( dist[j] , dist[t] + g[t][j]); // 感觉这里很妙，如果不连通就取不到后面的值
        // 标记已访问
        st[t] = true;
    }
    //返回答案
    return dist[n] == 0x3f3f3f3f ? -1 : dist[n]; // 找不到的话返回 -1
}

int main()
{
    cin>>n>>m;
    
    memset(g, 0x3f, sizeof g);
    
    for(int i = 0 ; i < m ;i ++)
    {
        int a, b, c;
        cin>>a>>b>>c;
        
        g[a][b] = min(g[a][b] , c);
    }
    
    cout<<dijkstra()<<endl;
    
    return 0;
}
```

#### 堆优化版本

[#tips](app://obsidian.md/index.html#tips) 没有调整过的cin 要比scanf 慢一倍左右

优化的点在于寻找为确定的点中的路径最短的点 -》 用优先队列代替循环
缺点：优先队列对空间的占用比较高，如果要追求空间利用率的话，需要自己实现一个优先队列（主要是实现删除操作）

```none
#include <iostream>
#include <cstring>
#include <queue>
// #include <vector> 定义小根堆的时候不要把它引入进来
using namespace std;

typedef pair<int , int> PII;

const int N = 1000010;
int h[N], e[N], ne[N], w[N], idx;
int n , m ;
int dist[N];// 记录每个点的最短距离
bool st[N]; // 标记已经是最短距离

void add(int a, int b , int c) // 邻接表， 使用w数组存储权重
{
    e[idx] = b, w[idx] = c, ne[idx] = h[a], h[a] = idx++;
}

int dijkstra()
{
    memset(dist, 0x3f, sizeof dist);//单源最短路，初始化距离
    dist[1] = 0;
    priority_queue<PII, vector<PII>, greater<PII>> heap;
    heap.push({0, 1}); // first 存储距离, second 存储编号
    
    while( heap.size() ) 
    {
        auto t = heap.top();
        heap.pop();
        
        int ver = t.second,  distance = t.first;
        
        if(st[ver]) continue; // 已经找过了的，不用再找了
        st[ver] = true;//已经是堆顶的了，最小的了，打上标记
        
        for(int i = h[ver]; i != -1 ; i = ne[i]) // 这里是通过邻接表存储，所以一定是能走到的
        {
            int j = e[i];
            if( dist[j] > dist[ver] + w[i])
            {
                dist[j] = dist[ver] + w[i];
                heap.push({dist[j], j});
            }
        }
    }
    
    return dist[n] == 0x3f3f3f3f ? -1 : dist[n];
    
}


int main()
{
    memset(h , -1, sizeof h); // 初始化邻接表的头
    scanf("%d%d", &n, &m);
    
    for(int i = 0 ; i < m ; i++)
    {
        int a, b ,c;
        scanf("%d%d%d", &a, &b, &c);
        add(a, b, c);
    }
    
    cout<<dijkstra()<<endl;
    
    return 0;
}
```

### Bellman - Ford

注意点：

- 

  图中不能有负权回路， 因为会在回路中循环， 形成 -∞的结果， 可以用来找

  负环

  ， 当在第n重循环时候如果还在更新时，就说明回路中存在n条边， 也就是存在 n + 1 个点， 所以在最短路径中存在重复的点，也就是环，而且由于正在更新，所以是负环。

- 

  但是一般不用Bellman - Ford 来寻找负环， 因为SPFA可以更快

- 

  Bellman-Ford 算法的特点在于它的循环次数是有意义的：当循环k次，也就是经过

  不超过k条边

  能得到的最小距离

```none
#include <iostream>
#include <cstring>
#include <algorithm>
using namespace std;

const int N = 510, M = 10010;

struct Edge{ //使用结构体存边
    int s, t, w;    
}edges[M]; 

int n, m, k;
int dist[N];
int backup[N];

void bellman_ford(){
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    
    for(int i = 0 ; i < k ; i++) // 遍历每一个顶点
    {
        memcpy(backup, dist, sizeof dist); // 备份,存储上一次更新完成的距离，防止数据短路
        for(int j =  0 ; j < m ; j++)
        {
            auto e = edges[j];
            dist[e.t] = min( dist[e.t], backup[e.s] + e.w); // 使用备份的距离来更新
        }
    }
}

int main (){
    scanf("%d%d%d", &n, &m, &k);
    
    for(int i = 0 ;i < m ;i++)
    {
        int s, t, w;
        scanf("%d%d%d", &s, &t, &w);
        edges[i] = {s, t, w};// 给边数组赋初值
    }
    
    bellman_ford();
    //因为有负权边， 所以可能会小于定义的最大值，但由于操作数有限制，所以最大值/2足够判断
    if( dist[n] > 0x3f3f3f3f / 2) puts("impossible");
    else printf("%d\n", dist[n]);
    
    return 0;
}
```

### SPFA

注意点：

- 

  图中不能存在负环

- 

  核心就是只更新变小了的， 而Bellman-Ford是所有的都更新一遍

- 

  同时由于只更新变小了的，就不用备份数组了

总体思路还是遍历所有边，只不过不是每一个点都要遍历到，只遍历那些变小了的点

```none
#include <iostream>
#include <cstring>
#include <queue>
#include <algorithm>
using namespace std;

const int N = 100010, M = 100010;
int h[N], e[N], ne[N], w[N], idx;
int n , m ;
int dist[N];
bool st[N];// 表示在队列里面的节点

void add(int a, int b, int c)
{
    e[idx] = b;
    w[idx] = c;
    ne[idx] = h[a];
    h[a] = idx++;
}

int spfa()
{
    memset(dist, 0x3f, sizeof dist);
    dist[1] = 0;
    
    queue<int> q;
    q.push(1);
    st[1] = true;
    
    while( q.size() )
    {
        int t = q.front();
        q.pop();
        
        st[t] = false; // 不要忘了取出来之后恢复状态
        
        for(int i = h[t]  ;i != -1 ; i = ne[i])
        {
            int j = e[i];
            if( dist[j] > dist[t] + w[i])
            {
                dist[j] = dist[t] + w[i];
                if( !st[j] )
                {
                    q.push(j);
                    st[j] = true;
                }
            }
        }
    }
    
    return dist[n]; // 在返回判断条件的时候注意题目要求
     
}

int main()
{
    scanf("%d%d", &n, &m);
    
    memset(h , -1, sizeof h);
    
    while( m -- )
    {
        int a, b, c;
        scanf("%d%d%d", &a, &b, &c);
        add(a, b, c);
    }
    
    int res = spfa();
    
    if( res == 0x3f3f3f3f ) cout<<"impossible"<<endl;
    else cout<<res<<endl;
    
    return 0;
}
```

spfa求负环

原理和Bellman-Ford 相同，都是抽屉原理
注意点：

- 

  负环并不一定存在于1->n

- 

  使用一个 cnt 数组来进行判定

```none
#include <iostream>
#include <cstring>
#include <queue>
#include <algorithm>
using namespace std;

const int N = 2010, M = 10010;

int n , m;
int h[N], e[M], ne[M], w[M], idx;
int dist[N], cnt[N];
bool st[N];


void add(int a, int b ,int c)
{
    e[idx] = b;
    ne[idx] = h[a];
    w[idx] = c;
    h[a] = idx ++;
}

bool spfa()
{
    queue<int> q ;
    for(int i = 1 ;i <= n; i++) 
    {
        q.push(i); // 所有的点都找一遍，负环不一定在以1为起点的最短路上 
        st[i] = true;
    }
    
    while( q.size() )
    {
        int t = q.front();
        q.pop();
        
        st[t] = false;
         
        for(int i = h[t] ; i != -1; i = ne[i])
        {
            int j = e[i];
            if( dist[j] > dist[t] + w[i]){
                
                dist[j] = dist[t] + w[i];
                cnt[j] = cnt[t] + 1; // 注意这里的递推关系
                
                if( cnt[j] >= n) return true;
                
                if( !st[j] )
                {
                    q.push(j);
                    st[j] = true;
                }
            }
        }
        
    }
    
    return false;
}

int main ()
{
    scanf("%d%d", &n , &m);
    
    memset(h , -1, sizeof h);
    
    while( m -- > 0)   
    {
        int a, b, c;
        scanf( "%d%d%d", &a, &b, &c);
        add(a, b, c);
    }
    
    if( spfa() ) puts("Yes");
    else puts("No");
    
    return 0;
}
```

### Floyd

```none
#include <iostream>
#include <algorithm>
using namespace std;

const int N = 210, INF = 0x3f3f3f3f;
int g[N][N];
int n , m , q;

void floyd()
{
    for(int k = 1; k <= n ; k++)
        for(int i = 1 ; i <= n ;i++)
            for(int j = 1; j <= n ; j++)
                g[i][j] = min( g[i][j] , g[i][k] + g[k][j]);// 一段的长度和两端接起来的长度取小
}

int main ()
{
    cin>>n>>m>>q;
    
    for(int i = 1 ; i <= n ; i++)
        for(int j = 1 ;j <= n ; j++)
            if( i == j ) g[i][j] = 0;
            else g[i][j] = INF;
    
    while( m --)
    {
        int s, t, w;
        cin>>s>>t>>w;
        g[s][t] = min(g[s][t], w); // 排除重复的、比较大的边
    }
    
    floyd();
    
    while( q -- )
    {
        int s , t;
        cin>>s>>t;
        
        if( g[s][t] > INF / 2 ) puts("impossible");
        else cout<<g[s][t]<<endl;
    }
    
    return 0;
}
```

### 小总结

```txt
---Dijkstra-朴素O(n^2)
初始化距离数组, dist[1] = 0, dist[i] = inf;
for n次循环 每次循环确定一个min加入S集合中，n次之后就得出所有的最短距离
将不在S中dist_min的点->t
t->S加入最短路集合
用t更新到其他点的距离
--tips: 这里的S集合是通过一个标记数组来实现的

---Dijkstra-堆优化O(mlogm)
利用邻接表，优先队列
在priority_queue[HTML_REMOVED], greater[HTML_REMOVED] > heap;中将返回堆顶
利用堆顶来更新其他点，并加入堆中类似宽搜

---Bellman_fordO(nm)
注意连锁现象 需要备份, struct Edge{inta,b,c} Edge[M];
初始化dist, 松弛dist[x.b] = min(dist[x.b], backup[x.a]+x.w);
松弛k次，每次访问m条边

----Spfa O(n)~O(nm)
利用队列优化仅加入修改过的地方
for k次
for 所有边利用宽搜模型去优化bellman_ford算法
更新队列中当前点的所有出边

---Floyd O(n^3)
初始化d
k, i, j 去更新d
```

## 最小生成树

### Prim 算法

#### 稠密图（朴素版）O(n ^ 2)

算法流程：
**dijkstra**:

1. 初始化距离数组
2. 迭代n次，每次寻找不在集合中的， 距离最小的点
3. 使用距离最小的点来更新其它点到**起点**的距离

**Prim** :

1. 初始化距离数组
2. 迭代，找到集合外距离最近的点 -> t
3. 用 t 更新其它点到**集合**的距离
4. 将 t 加入到集合中

```none
#include <iostream>
#include <cstring>

using namespace std;
const int N = 510, INF = 0x3f3f3f3f;
int g[N][N], d[N]; // 稠密图，使用邻接矩阵 ， d存储点到集合的最短距离
bool st[N]; // 标识集合
int n , m;

int prim(){
    
    memset(d, 0x3f, sizeof d);
    
    int res = 0;// 存储最小生成树的总权值
    
    for(int i = 0 ; i < n ;i ++){
	    //1.查找到集合距离最小的点
        int t = -1;
        for(int j = 1; j <= n ;j++)
            if( !st[j] && ( t == -1 || d[t] > d[j]))
                t = j;
    
        if( i && d[t] == INF) return INF;
        
        if( i ) res += d[t];
        st[t] = true;
        
        for(int j = 1; j <= n ;j++) d[j] = min(d[j] , g[j][t]); // 更新每个点到集合的最短距离
    }
    return res;
}

int main(){
    
    cin>>n>>m;
    
    memset(g, 0x3f , sizeof g);
    
    while( m -- > 0 )
    {
        int a, b, c;
        cin>>a>>b>>c;
        g[a][b] = g[b][a] = min(g[a][b], c); // 无向图存两个方向
    }
    
    int t = prim();
    
    if( t == INF) cout<<"impossible"<<endl;
    else cout<<t<<endl;
    
    return 0;
} 
```

#### 稀疏图（堆优化版）O(mlogn) -- 少用

> 暂时没讲

### Kruskal 算法 O(mlogm) -- 稀疏图

算法流程：

1. 将所有**边**按权重排序 O( mlogm ) ，算法的速度瓶颈

2. 

   枚举每条边 a -> b ， 权重为 c

   - 

     如果 a, b 不连通，将边加入集合中

```none
#include <iostream>
#include <algorithm>

using namespace std;

const int N = 100010, M = 200010, INF = 0x3f3f3f3f;
int p[N];
int n , m;

struct Edge{
    int a, b, w;
    
    bool operator < (const Edge & W) const//重载小于号
    {
        return w < W.w;
    }
}edges[M];

int find(int x)
{
    if( p[x] == x) return p[x];
    return p[x] = find(p[x]);
}

int kruskal(){
    
    sort(edges, edges + m); // 给所有边排序
    
    for(int i = 1; i <= n; i++) p[i] = i;
    
    int res = 0 , cnt = 0;
    for(int i = 0 ; i < m ; i++)
    {
        int a = edges[i].a, b = edges[i].b, w = edges[i].w;
        
        a = find(a), b = find(b);
        if( a != b ) // 如果不连通就合并
        {
            p[a] = b;
            res += w;
            cnt++;
        }
    }
    
    if( cnt < n - 1) return INF; // 如果最终有点没有合并进来，就说明无法构成生成树
    else return res;
}

int main (){
    
    cin>>n>>m;
    
    for(int i = 0 ; i < m ; i++)
    {
        int a, b, w;
        scanf("%d%d%d", &a, &b, &w);
        edges[i] = {a, b, w};
    }
    
    int t = kruskal();
    
    if( t == INF ) puts("impossible");
    else printf("%d\n", t);
    
    return 0;
}
```

## 二分图

定义：可以将一个二分图分为两个集合，只有集合之间存在边，而集合内部没有边
性质：当且仅当图当中不含奇数环（充要条件）

过程：

1. 选取一个点加入左边
2. 遍历它连通的第一层节点，加入右边
3. 再遍历下一层节点，加入左边
4. 递归实现以上过程，就可以完成染色

不含有奇数环时，上述过程没有矛盾

### 染色法 O( m +n )

```none
#include <iostream>
#include <cstring>

using namespace std;

const int N = 100010, M = 200020;

int h[N] , e[M], ne[M], idx;
int color[N];
int n, m;

void add(int a, int b){
    e[idx] = b;
    ne[idx] = h[a];
    h[a] = idx++;
}

bool dfs(int u, int c)
{
    color[u] = c;// 给这个节点染色
    
    for(int i = h[u] ; i != -1 ; i = ne[i]) // 给它连通的节点染色
    {
        int j = e[i];
        if( !color[j] )
        {
            if( !dfs(j , 3 - c)) return false; // 3 - c 是为了在 1 和 2 之间切换
        }
        else if( color[j] == c) return false ; // 和父节点一个颜色，冲突
    }
    
    return true;
}

int main ()
{
    cin>>n>>m;
    
    memset(h, -1 , sizeof h);
    
    while( m -- )
    {
        int a, b;
        cin>>a>>b;
        add(a, b), add(b, a);
    }
    
    bool flag = true;
    
    for(int i = 1; i <= n ;i++) // 因为不一定是连通图，所以要确保遍历到所有点
    {
        if( !color[i] )
        {
            if( !dfs(i , 1) )
            {
                flag = false;
                break;
            }
        }
    }
    
    if( flag ) puts("Yes");
    else puts("No");
    
    return 0;
}
```

TARGET DECK: 算法

### 匈牙利算法 O(mn)

> 实际运行时间一般远小于 O(mn)

基本思路：
有两边

1. 选取左边的每一个点，在和它连通的点中寻找一个未匹配的点
2. **核心**： 如果所有点都已经匹配了， 那么让和右边点**匹配的点**寻找右边是否还有没匹配的点，如果有，就匹配
3. 然后将当前已经匹配的点和当前左边节点匹配

> 两全其美~~~

注意点：判重(这里主要是判右边) | find函数的意义 | 为啥存单边

```none
#include <iostream>
#include <cstring>
#include <algorithm>

using namespace std;

const int N = 510, M = 100010; // 这里虽然是无向边， 但是实际的算法流程中存有向边就可以完成
int h[N], e[M], ne[M], idx;
int match[N]; // 用来记录已经匹配的点
int n1, n2 , m;
bool st[N]; // 避免在一次find过程中访问重复的右边的点

void add(int a, int b){
    e[idx] = b, ne[idx] = h[a], h[a] = idx++;
}

bool find(int u )
{
    for(int i = h[u]; i != -1; i = ne[i]) // 给 u 寻找匹配
    {
        int j = e[i];
        
        if( !st[j] )
        {
            st[j] = true;
            if( match[j] == 0 || find(match[j]) )
            {
                match[j] = u;
                return true; // 可以找到，返回 true
            }
        }
    }
    
    return false; // 找不到， 返回 false
}

int main (){
    
    cin>>n1>>n2>>m;
    
    memset(h , -1, sizeof h);
    
    while( m -- )
    {
        int a, b;
        cin>>a>>b;
        add(a,b);
    }
    
    int res = 0; // 存储匹配数量
    
    for(int i = 1; i <= n1 ;i ++) // 考虑每一个左边的点
    {
        memset(st , false , sizeof st);
        
        if( find( i ) ) res ++;
    }
    
    cout<<res<<endl;
    
    return 0;
}
```

# 数学知识

## 数论

### 质数

```none
1.质数和合数是针对所有大于1的 “自然数” 来定义的(所有小于等于1的数都不是质数).
2.所有小于等于1的整数既不是质数也不是合数.
3.质数和素数都是同一种性质,只是叫法不同.

4.质数的判定------试除法 或 六倍原理.
(1).”d|n”代表的含义是d能整除n,(这里的”|”代表整除).
(2).一个合数的约数总是成对出现的,如果d|n,那么(n/d)|n,因此我们判断一个数是否为质数的时候,
只需要判断较小的那一个数能否整除n就行了,即只需枚举d<=(n/d),即dd<=n,d<=sqrt(n)就行了.
(3).sqrt(n)这个函数执行的时候比较慢.


5.分解质因数------试除法.(用到的原理:唯一分解定理(算数基本定理))
(1).特别要注意------分解质因数与质因数不一样!!!!!!
(2).分解质因数是一个过程,而质因数是一个数.
(3).一个合数分解而成的质因数最多只包含一个大于sqrt(n)的质因数
(反证法,若n可以被分解成两个大于sqrt(n)的质因数,则这两个质因数相乘的结果大于n,与事实矛盾).
(4).当枚举到某一个数i的时候,n的因子里面已经不包含2-i-1里面的数,
如果n%i==0,则i的因子里面也已经不包含2-i-1里面的数,因此每次枚举的数都是质数.
(5).算数基本定理(唯一分解定理):任何一个大于1的自然数N,如果N不为质数,那么N可以唯一分解成有限个质数的乘积
N=P1a1P2a2P3a3......Pnan，这里P1<P2<P3......<Pn均为质数，其中指数ai是正整数。
这样的分解称为 N 的标准分解式。最早证明是由欧几里得给出的，由陈述证明。
此定理可推广至更一般的交换代数和代数数论。
(6).质因子（或质因数）在数论里是指能整除给定正整数的质数。根据算术基本定理，不考虑排列顺序的情况下，
每个正整数都能够以唯一的方式表示成它的质因数的乘积。
(7).两个没有共同质因子的正整数称为互质。因为1没有质因子，1与任何正整数（包括1本身）都是互质。
(8).只有一个质因子的正整数为质数。


6.筛质数.
6.1:朴素筛法.
(1).做法:把2~(n-1)中的所有的数的倍数都标记上,最后没有被标记的数就是质数.
(2).原理:假定有一个数p未被2~(p-1)中的数标记过,那么说明,不存在2~(p-1)中的任何一个数的倍数是p,
也就是说p不是2~(p-1)中的任何数的倍数,也就是说2~(p-1)中不存在p的约数,因此,根据质数的定义可知:
p是质数.
(3).调和级数:当n趋近于正无穷的时候,1/2+1/3+1/4+1/5+…+1/n=lnn+c.(c是欧阳常数,约等于0.577左右.).
(4).底数越大,log数越小
(4).时间复杂度:约为O(nlogn);(注:此处的log数特指以2为底的log数).

6.2:埃氏筛(稍加优化版的筛法).
(1).质数定理:1~n中有n/lnn个质数.
(2).原理:在朴素筛法的过程中只用质数项去筛.
(3).时间复杂度:粗略估计:O(n).实际:O(nlog(logn)).
(4).1~n中,只计算质数项的话,”1/2+1/3+1/4+1/5+…+1/n”的大小约为log(logn).

6.3:线性筛
(1).若n在10的6次方的话,线性筛和埃氏筛的时间效率差不多,若n在10的7次方的话,线性筛会比埃氏筛快了大概一倍.
(2).思考:一:线性筛法为什么是线性的?
二:线性筛法的原理是什么?
(3).核心:1~n内的合数p只会被其最小质因子筛掉.
(4).原理:1~n之内的任何一个合数一定会被筛掉,而且筛的时候只用最小质因子来筛,
然后每一个数都只有一个最小质因子,因此每个数都只会被筛一次,因此线性筛法是线性的.
(5).枚举到i的最小质因子的时候就会停下来,即”if(i%primes[j]==0) break;”.
(6).因为从小到大枚举的所有质数,所以当”i%primes[j]!=0”时,primes[j]一定小于i的最小质因子,
primes[j]一定是primes[j]i的最小质因子.
(7).因为是从小到大枚举的所有质数,所以当”i % primes[j] == 0”时,primes[j]一定是i的最小质因子,
而primes[j]又是primes[j]的最小质因子,因此primes[j]是i primes[j]的最小质因子.
(8).关于for循环的解释:
注:首先要把握住一个重点:我们枚举的时候是从小到大枚举的所有质数
1.当i%primes[j]==0时,因为是从小到大枚举的所有质数,所以primes[j]就是i的最小质因子,而primes[j]又是其本身
primes[j]的最小质因子,因此当i%primes[j]==0时,primes[j]是primes[j]i的最小质因子.
2.当i%primes[j]!=0时,因为是从小到大枚举的所有质数,且此时并没有出现过有质数满足i%primes[j]==0,
因此此时的primes[j]一定小于i的最小质因子,而primes[j]又是其本身primes[j]的最小质因子,
所以当i%primes[j]!=0时,primes[j]也是primes[j]i的最小质因子.
3.综合1,2得知,在内层for循环里面无论何时,primes[j]都是primes[j]i的最小质因子,因此”st[primes[j]i]=true”
语句就是用primes[j]i这个数的最小质因子来筛掉这个数.
```

#### 代码实现

###### 试除法

1. 试除法（定义） O( sqrt( n ) )

```none
#include <iostream>
using namespace std;

bool is_prime(int x)
{
    if( x < 2) return false;
    for(int i = 2 ; i <= x / i ; i++) // 这种写法更推荐，不会爆 int ，效率也不低
    {
        if( x % i == 0) return false;
    }
    return true;
}

int main(){
    
    int n ;

    cin>>n;
    
    while( n -- )
    {
        int a;
        cin>>a;
        
        if( is_prime(a) ) cout<<"Yes"<<endl;
        else cout<<"No"<<endl;
    }
    
    return 0;
}
```

1. 分解质因数 O( sqrt( n ) )
   这个 sqrt( n ) 的常数会更小， 时间复杂度是`log n --- sqrt(n)`
   思路：

- 

  从小到大尝试n 的所有约数

```none
#include <iostream>

using namespace std;

int divide( int n )
{
    for(int i = 2; i <= n / i ; i++)
    {
        if( n % i == 0) // 这里是循环的，所以后面的质数不包含前面的质数，不会存在前面质数作为因子，也就是一定是一个质数
        {
            int s = 0;
            while( n % i == 0)
            {
                n /= i;
                s++;
            }
            printf("%d %d \n", i, s);
        }
    }
    
    if( n > 1 ) printf("%d %d \n", n , 1);// 自己就是质因数
    
}

int main()
{
    int n ;
    cin>>n;
    
    while( n -- )
    {
        int x; 
        cin>>x;
        divide(x);
        puts("");
    }
    
    return 0;
}
```

###### 筛法

1. 埃氏筛法
   时间复杂度接近于 O( n )

```none
#include <iostream>

using namespace std;

const int N = 1000010;

int get_primes(int n)
{
    int primes[N];
    bool st[N];
    int cnt = 0;
    for(int i = 2; i <= n ;i++)
    {
        if( st[i] ) continue; // 筛过了
        primes[cnt ++] = i; // 质数存起来
        for(int j = i + i ; j <= n ; j = j + i) // 把它的整数倍都筛掉 
            st[j] = true;
    }
    
    return cnt;
}

int main()
{
    int n ;
    cin>>n;
    
    int res = get_primes(n);
    
    cout<<res<<endl;
    
    return 0;
}
```

1. 线性筛

核心在于保证了每一个合数一定是被自己的最小质因子筛掉的

在实际的使用中，一般是使用线性筛，而埃氏筛更多的是用它的思路来解决其它问题

```none
#include <iostream>

using namespace std;

const int N = 1000010;

int get_primes(int n)
{
    int primes[N];
    bool st[N];
    int cnt = 0;
    
    for(int i = 2;  i <= n ;i++)
    {
        if( !st[i] ) primes[ cnt++ ] = i;
        for(int j = 0 ; primes[j] <= n / i ; j++) // 从当前已知的质因数里面选
        {
            st[ primes[j] * i ] = true; // 把所有质因数的  i  倍都筛掉
            // 如果已经到了 i 的最小公因数，那么就完成对这个数的筛选
            // 因为比 i 小的质因数都进行了筛选，所以完成之后 i 就是下一个最小质因数
            if( i % primes[j] == 0 ) break;
        }
    }
    
    return cnt;
}

int main()
{
    int n ;
    cin>>n;
    
    int res = get_primes(n);
    
    cout<<res<<endl;
    
    return 0;
}
```

### 约数

#### 试除法

- 

  时间复杂度：O( sqrt(n) )

- 

  

  思路：

  - 

    从小到大枚举，因为 a | b , a / b | b ， 所以我们只需要枚举到 n / i ， 也就是开方的时间复杂度

  - 

    约数有a, b两个，当我们找到 a | n 时， b = n / a， 但是这里需要考虑平方的情况，判断一下。

```none
#include <iostream>
#include <algorithm>
#include <vector>

using namespace std;

vector<int> get_divitors(int n)
{
    vector<int> res;
    for(int i = 1;  i <= n / i ; i++)
    {
        if( n % i == 0) 
        {
            res.push_back(i); // 小的约数
            if( i != n / i ) res.push_back( n / i );// 大的约数 
        }
    }
    
    sort(res.begin(), res.end());
    
    return res;
}

int main(){
    
    int n ;
    cin>>n;

    while( n -- )
    {
        int x ;
        cin>>x;
        
        auto arr = get_divitors(x);   
        
        for(auto num : arr)
        {
            cout<<num<<" ";
        }
        
        cout<<endl;
    }
    return 0;
}
```

#### 约数个数

公式： `(a1 + 1 ) * (a2 + 1) *...* ( an + 1)` ， 这里的 a 是指约数的幂形式的**指数**

算法流程：

1. 先求约数
2. 使用公式计算约数的个数

```none
#include <iostream>
#include <unordered_map>

using namespace std;

typedef long long LL;

const int mod = 1e9 + 7;

int main(){
    
    int n ;
    cin>>n;
    
    unordered_map<int , int> primes;
    
    while( n -- )
    {
        int x;
        cin>>x;
        
        for(int i = 2; i <= x / i ; i ++)
        {
            while( x % i == 0 )
            {
                x /= i;
                primes[i] ++; // 求出约数对应的次数
            }
        }
        if( x > 1) primes[x] ++; // 如果最后它没除完， 说明剩下的那个数也是约数
    }
    
    LL res = 1;
    for(auto p : primes ) res = res * ( p.second + 1) % mod; // 求约数的公式
    
    cout<<res<<endl;
    
    return 0;
}
```

#### 约数之和

![Pasted image 20221204152937.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221204152937.png?1670138977000)

```none
#include <iostream>
#include <unordered_map>

using namespace std;

typedef long long LL;

const int mod = 1e9 + 7;

int main (){
    
    int x;
    cin>>x;
    
    unordered_map<int, int> primes; 
    
    while( x -- ) // 将输入的数分解质因数
    {
        int n;
        cin>>n;
        
        for(int i = 2; i <= n / i ; i++)
        {
            int cnt = 0;
            if( n % i == 0 )
            {
                while( n % i == 0 )
                {
                    n /= i;
                    primes[i]++;
                }
            }
        }
        if( n > 1 ) primes[n]++; 
    }
    
    LL res = 1;
    for( auto p : primes ) // 公式求解质因数的和
    {
        LL t = 1;
        int a = p.first, b = p.second;
        while( b -- ) t = ( t * a + 1 ) % mod;
        res = res * t % mod;
    }
    
    cout<<res<<endl;
    
    return 0;
}
```

#### 最大公约数

```
这里直接使用辗转相除法，这个算法的代码比较简单，倒是证明比较复杂
#include <iostream>

using namespace std;

int gcd(int a, int b)
{
    return b ? gcd(b, a % b) : a;
}

int main ()
{
    int n ;
    cin>>n;
    
    while( n -- )
    {
        int a, b;
        cin>>a>>b;
        
        cout<<gcd(a, b)<<endl;
        
    }
    
    return 0;
}
```

## 欧拉函数

![Pasted image 20221125202428.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221125202428.png?1669379068000)
公式的原理是容斥原理
![Pasted image 20221125222938.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221125222938.png?1669386578000)

### 朴素实现

> 时间复杂度 O( sqrt( n ) ) ， 瓶颈在求质数

```none
#include <iostream>
using namespace std;

int euler (int n )
{
    int res = n; 
    for(int i = 2 ; i <= n / i ; i++)
    {
        if( n % i == 0 )
        {
            res = res / i * ( i - 1 );
            while( n % i == 0 ) n /= i ;
        }
    }
    if( n > 1 ) res = res / n * (n - 1);
    
    return res;
}

int main()
{
    int n;
    cin>>n;
    
    while(  n -- )
    {
        int x;
        cin>>x;
        cout<<euler(x)<<endl;
    }
    
    return 0;
    
}
```

### 线性筛实现

![Pasted image 20221126121729.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221126121729.png?1669436249000)

- 

  重合的质因子

  只算一遍

```none
#include <iostream>

using namespace std;

typedef long long LL; // 因为累加可能会爆int

const int N = 1000010;

int primes[N];
int phi[N];
bool st[N];

LL get_euler(int n ) // 在使用筛法的过程中进行求解
{
    int cnt = 0 ;
    phi[1] = 1;// 根据定义得到
    for(int i = 2 ; i <= n; i++)
    {
        if( !st[i] ) // 是一个质数
        {
            phi[i] = i - 1; // 1 - i 的数都和它本身互质， 因为它就是一个质数
            primes[ cnt++ ] = i;
        }
        for(int j = 0 ; primes[j] <= n / i ; j ++)
        {
            st[primes[j] * i] = true;
            if( i % primes[j] == 0 ) {
                phi[primes[j] * i] = phi[i] * primes[j] ; //这里是因为 primes[j] 就是 i 的最小质因子
                //欧拉函数的除了 N 的部分，表示出来和 phi[i] 是等价的，所以只需要再乘上一个 primes[j] 就好
                break;
            }
            phi[ primes[j] * i ] = phi[i] * ( primes[j] - 1 );
        }
    }
    
    LL res = 0;
    for(int i = 1 ; i <= n ;i++) res+= phi[i];
    
    return res;
}

int main(){
    
    int n;
    cin>>n;
    
    LL t = get_euler(n);
    
    cout<<t<<endl;
    
    return 0;
}
```

## 快速幂

![Pasted image 20221208220606.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221208220606.png?1670508366000)
总的来说就是通过将一个数的指数分解为2的幂的和， 因为积的模等于分别模之后再乘积，这样就可以通过分解计算、再求积的方式得到结果
核心在于：分解指数为2的幂的和， 得到 O( log n ) 的时间复杂度

```none
#include <iostream>
using namespace std;

typedef long long LL ;

int qmi(int a, int k, int m)
{
    int res = 1 % m;
    
    while( k )
    {
        if( k & 1 )  res = res * a  %  m ; // 区分 k 是奇数还是偶数
        
        a = a * (LL)a % m ; // 相乘
        
        k >>= 1;
    }
    
    return res;
}

int main (){
    
    int n ;
    
    scanf("%d" , &n);
    
    while( n --)
    {
        int a, k, m;
    
        scanf("%d%d%d", &a, &k, &m);
    
        printf("%lld \n", qmi(a, k, m ));
    
    }
    
    return 0;
}
```

### 快速幂求逆元

![Pasted image 20221208225900.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221208225900.png?1670511540000)
理解的点：

1. 数 * 逆元 = 1
2. 费马小定理

```none
#include <iostream>
#include <algorithm>

using namespace std;

typedef long long LL;


LL qmi(int a, int b, int p)
{
    LL res = 1; // 结果可能爆int
    while (b)
    {
        if (b & 1) res = res * a % p;
        a = a * (LL)a % p;
        b >>= 1;
    }
    return res;
}


int main()
{
    int n;
    scanf("%d", &n);
    while (n -- )
    {
        int a, p;
        scanf("%d%d", &a, &p);
        if (a % p == 0) puts("impossible");
        else printf("%lld\n", qmi(a, p - 2, p));
    }

    return 0;
}
```

## 拓展欧几里得算法

### 裴蜀定理

```
对于任意的正整数 a , b , 一定存在非零整数 x, y ，使得 ax + by = (a, b) ==> a 和 b 的最大公约数
```

使用拓展欧几里得算法来求解
![Pasted image 20221209104109.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221209104109.png?1670553669931)

```none
#include <iostream>
using namespace std;

int exgcd(int a, int b, int &x, int &y)
{
    if( !b )
    {
        x = 1, y = 0;
        return a;
    }
    
    int d = exgcd(b, a % b, y ,x );// 递归处理
    y = y - a / b * x; // 这里的x y 在公式中的表示是替换过了的
    
    return d;
}

int main(){
    
    int n;
    scanf("%d", &n);
    
    while(n -- )
    {
        int a, b, x, y;
        scanf("%d%d", &a, &b);
        
        exgcd(a, b, x, y);  
        
        printf("%d %d \n", x, y);
    }
    
    return 0;
}
```

- 

  推导不难，代码的理解有难度

### 求解线性同余方程

![Pasted image 20221209112733.png](app://local/C:/Users/kcp/OneDrive/Obisidian/%E5%A4%A7%E5%AD%A6-%E7%94%B5%E4%BF%A1++/Pasted%20image%2020221209112733.png?1670556453141)

- 

  使用拓展欧几里得求得的是 gcd(a, m) ， 而 b 是它的倍数， 所以最后需要用

   

  ```
  b / d * x % m
  ```

   

  来确定

```none
#include <iostream>
#include <algorithm>

using namespace std;

typedef long long LL;


int exgcd(int a, int b, int &x, int &y)
{
    if (!b)
    {
        x = 1, y = 0;
        return a;
    }
    int d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}


int main()
{
    int n;
    scanf("%d", &n);
    while (n -- )
    {
        int a, b, m;
        scanf("%d%d%d", &a, &b, &m);

        int x, y;
        int d = exgcd(a, m, x, y);
        if (b % d) puts("impossible");
        else printf("%d\n", (LL)b / d * x % m);
    }

    return 0;
}
```

## 中国剩余定理

# 动态规划

## 常见模型

### 背包

#### 01背包

每个物品只有一个

> 题例：有 N件物品和一个容量是 V 的背包。每件物品只能使用一次。第 i 件物品的体积是 vi，价值是 wi。求解将哪些物品装入背包，可使这些物品的总体积不超过背包容量，且总价值最大。

##### 分析

- 

  

  状态**表示**

  - 

    

    集合

    - 

      所有选择

    - 

      

      条件

      - 

        只从前 i 个物品中选

      - 

        总体积 <= j

  - 

    属性 -- min |

     

    max

     

    | 数量

- 

  

  状态**计算**
  一般对应集合的划分 --- **不重 & 不漏**
  这里划分 f ( i , j )

  - 

    不包含 i ( 第 i 个物品) ， 从 i - 1中选 ， 体积小于 j ， 且不包含 i --- 最大值就是

     

    ```
    f ( i - 1 , j)
    ```

  - 

    包含 i ， 从 i - 1 中选 ， 体积小于 j ， 且包含 i --- 最大值就是

     

    ```
    f(i , j)
    ```

    因为不论第

    ```
    i 
    ```

    个物品是否加入，都不影响

     

    ```
    i - 1
    ```

     

    个物品的最大值， 以此类推， 第

     

    ```
    i - n 
    ```

    和第

     

    ```
    i - n - 1 
    ```

    同样成立

    第

     

    ```
    i
    ```

     

    个物品在v下的最大值也就可以表示为

     

    ```
    f(i - 1, v ) + w[i]
    ```

     

    了

  最后， 因为我们取的是二者的最大值，也就得到`f(i, j) = max( f(i, j ) , f(i - 1, v - w[i]) + v[i]` ，作为我们的结果

```none
#include <iostream>
#include <algorithm>

using namespace std;

const int N = 1010;

int n, m ;
int v[N], w[N]; // 表示价值和重量
int f[N][N]; // f[i][j] 表示在容量为 v 的条件下，1 ~ i - 1 件物品的最大价值

int main(){
    
    cin>>n>>m;
    
    for(int i = 1; i <= n ; i++ ) cin>> w[i] >> v[i];
    
    for(int i = 1 ;i <= n ; i++ )
        for(int j = 0; j <= m ; j++)
        {
            // 不包含 i 的
            f[i][j] = f[i - 1][j];
            if( j >= w[i] ) // 装得下的情况下
            {
                // 包含 i 的
                f[i][j] = max( f[i][j] , f[i - 1][j - w[i] ] + v[i] );
            }
        }
    
    cout<< f[n][m] <<endl;
    
    return 0;
}
```

将状态`f[i][j]`优化到一维`f[j]`，实际上只需要做一个等价变形。

为什么可以这样变形呢？我们定义的状态`f[i][j]`可以求得**任意合法的`i`与`j`最优解**，但题目只需要求得**最终状态**`f[n][m]`，因此我们只需要一维的空间来更新状态。

（1）状态`f[j]`定义：N件物品，背包容量`j`下的最优解。

（2）注意枚举背包容量`j`必须从`m`开始。 -- 背包变量的污染

（3）为什么一维情况下枚举背包容量需要逆序？在二维情况下，状态`f[i][j]`是由上一轮`i - 1`的状态得来的，`f[i][j]`与`f[i - 1][j]`是独立的。而优化到一维后，如果我们还是正序，则有`f[较小体积]`更新到`f[较大体积]`，则有可能本应该用第`i-1`轮的状态却用的是第`i`轮的状态。

（4）例如，一维状态第i轮对体积为3的物品进行决策，则`f[7]`由`f[4]`更新而来，这里的`f[4]`正确应该是`f[i - 1][4]`，但从小到大枚举j这里的`f[4]`在第`i`轮计算却变成了`f[i][4]`。当逆序枚举背包容量j时，我们求`f[7]`同样由`f[4]`更新，但由于是逆序，这里的`f[4]`还没有在第i轮计算，所以此时实际计算的`f[4]`仍然是`f[i - 1][4]`。

（5）简单来说，一维情况正序更新状态`f[j]`需要用到前面计算的状态已经被「**污染**」，逆序则不会有这样的问题。

状态转移方程为：`f[j] = max(f[j], f[j - v[i]] + w[i]` 。

```none
#include <iostream>
#include <algorithm>
using namespace std;

const int N = 1010;

int n, m ;
int v[N], w[N]; // 表示价值和重量
int f[N]; // f[j] ，表示在 j 的的容量下的最大价值

int main(){
    
    cin>>n>>m;
    
    for(int i = 1; i <= n ; i++ ) cin>> w[i] >> v[i];
    
    for(int i = 1 ;i <= n ; i++ )
        for(int j = m; j >= w[i] ; j--) //  j < w[i] 的情况会直接略过 ， 倒序是避免污染源数据。
        {
            // if( j >= w[i] ) 
            // {
                // f[i][j] = max( f[i][j] , f[i - 1][j - w[i] ] + v[i] );
                f[j] = max( f[j] , f[j - w[i]] + v[i] );
            // }
        }
    
    cout<< f[m] <<endl;
    
    return 0;
}
```

#### 完全背包

每个物品有无限个

#### 多重背包

#### 分组背包

### 线性DP

### 区间 DP

### 计数类 DP

### 数位统计DP

### 状态压缩 DP

### 树形 DP

### 记忆化搜索