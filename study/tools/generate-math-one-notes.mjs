import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(toolDir, "../..");
const studyRoot = path.join(siteRoot, "study");

const today = new Date(Date.UTC(2026, 5, 3, 12));

const chapters = [
  {
    part: "高等数学",
    title: "函数、极限与连续",
    slug: "math1-01-functions-limits-continuity",
    summary: "从函数性质、极限计算到连续性判定，建立数学一高数部分的入口。",
    knowledge: [
      "函数的概念：定义域、值域、对应关系、反函数、复合函数、分段函数和隐函数。",
      "函数性质：有界性、单调性、奇偶性、周期性，以及这些性质在证明和作图中的使用。",
      "基本初等函数与初等函数：幂、指数、对数、三角、反三角函数的定义域、单调区间和常用等价形式。",
      "数列极限：收敛定义、唯一性、有界性、保号性、夹逼准则、单调有界准则。",
      "函数极限：$x\\to x_0$、$x\\to\\infty$、单侧极限和双侧极限的关系。",
      "无穷小与无穷大：阶的比较、等价无穷小、同阶、高阶、低阶和主部思想。",
      "极限运算法则：四则运算、复合函数极限、变量代换和局部等价替换。",
      "两个重要极限：$\\lim_{x\\to0}\\frac{\\sin x}{x}=1$ 与 $\\lim_{x\\to\\infty}(1+\\frac1x)^x=e$。",
      "连续性：一点连续、区间连续、初等函数连续性、间断点分类、闭区间连续函数性质。",
      "渐近线：水平、垂直、斜渐近线的判定与求法。"
    ],
    formulas: [
      "$\\sin x\\sim x,\\ 1-\\cos x\\sim \\frac{x^2}{2},\\ \\ln(1+x)\\sim x,\\ e^x-1\\sim x$",
      "$\\lim f(x)=A,\\ \\lim g(x)=B\\Rightarrow \\lim[f(x)g(x)]=AB$",
      "闭区间连续：有界性、最值定理、介值定理、零点定理。"
    ],
    problemTypes: [
      "求函数定义域、复合函数表达式、反函数表达式与分段函数极限。",
      "利用等价无穷小、泰勒主部或有理化处理 $0/0$、$\\infty/\\infty$、$1^\\infty$ 型极限。",
      "用夹逼准则处理含 $\\sin$、取整、绝对值、积分或递推形式的极限。",
      "判断间断点类型：可去、跳跃、无穷、振荡，并求参数使函数连续。",
      "证明方程有根：把问题转化为连续函数在闭区间上的零点定理。",
      "求渐近线，尤其注意斜渐近线 $y=ax+b$ 中 $a,b$ 的极限定义。",
      "比较无穷小阶数，判断哪个局部主部支配极限。"
    ],
    methods: [
      "先定型，再选工具：代入后不是未定式时直接算；是未定式再考虑等价、洛必达或泰勒。",
      "遇到根式差优先有理化；遇到 $a^b$ 优先取对数；遇到复杂复合先换元。",
      "连续性题目先查定义域，再分别看函数值、左极限、右极限。"
    ],
    pitfalls: [
      "等价无穷小只能在乘除结构中直接替换，加减结构要保留到同一阶主部。",
      "双侧极限存在必须左右极限都存在且相等。",
      "闭区间性质不能随意用在开区间或不连续函数上。"
    ]
  },
  {
    part: "高等数学",
    title: "一元函数微分学",
    slug: "math1-02-single-variable-differential",
    summary: "掌握导数、微分、中值定理和函数性态分析，是高数证明题与综合题的核心。",
    knowledge: [
      "导数定义：差商极限、左导数、右导数、可导与连续的关系。",
      "求导法则：四则、复合、反函数、隐函数、参数方程、对数求导。",
      "高阶导数：常见函数高阶导数、莱布尼茨公式、递推型高阶导数。",
      "微分：一阶微分形式不变性、近似计算和误差估计。",
      "微分中值定理：罗尔、拉格朗日、柯西中值定理的条件与结论。",
      "洛必达法则：适用条件、未定式转化和不能滥用的边界。",
      "泰勒公式：皮亚诺余项、拉格朗日余项、常用展开式和局部主部。",
      "函数单调性、极值、最值、凹凸性、拐点和曲率直观。",
      "方程根、不等式与函数证明：构造辅助函数、导数判号和端点分析。"
    ],
    formulas: [
      "$f'(x_0)=\\lim_{\\Delta x\\to0}\\frac{f(x_0+\\Delta x)-f(x_0)}{\\Delta x}$",
      "$f(x)=f(x_0)+f'(x_0)(x-x_0)+\\cdots+\\frac{f^{(n)}(x_0)}{n!}(x-x_0)^n+R_n$",
      "拉格朗日中值定理：$f(b)-f(a)=f'(\\xi)(b-a)$。"
    ],
    problemTypes: [
      "按定义求导或判断某点可导，常见于绝对值、分段、取整和参数函数。",
      "隐函数、参数方程、反函数求导，尤其是求 $\\frac{dy}{dx}$、$\\frac{d^2y}{dx^2}$。",
      "高阶导数计算：拆分、递推、莱布尼茨公式和泰勒系数法。",
      "用中值定理证明等式或不等式：先看结论像差值还是导数。",
      "函数单调、极值、凹凸、拐点、渐近线综合作图。",
      "根的个数问题：导数分区间判单调，再结合端点符号。",
      "证明不等式：构造 $F(x)$，用导数判号或泰勒余项控制。"
    ],
    methods: [
      "看到 $f(b)-f(a)$ 先想中值定理；看到 $f'(\\xi)$ 先想构造闭区间。",
      "复杂极限若等价无穷小不够，转泰勒；洛必达只能在条件完整时使用。",
      "函数性态题按定义域、导数零点、不可导点、二阶导、端点值的顺序做表。"
    ],
    pitfalls: [
      "可导必连续，连续不一定可导。",
      "极值点可以出现在导数为零、导数不存在或区间端点。",
      "洛必达不是化简工具，必须先确认未定式和邻域可导条件。"
    ]
  },
  {
    part: "高等数学",
    title: "一元函数积分学",
    slug: "math1-03-single-variable-integral",
    summary: "把不定积分、定积分、反常积分和几何应用连成一条计算线。",
    knowledge: [
      "原函数与不定积分：基本积分表、线性性质和换元思路。",
      "第一类换元、第二类换元：三角代换、根式代换、倒代换。",
      "分部积分：乘积结构、循环积分、递推积分。",
      "有理函数积分：部分分式分解、真分式与假分式处理。",
      "定积分定义与性质：可积条件、区间可加、保号性、估值、对称性。",
      "变上限积分：连续性、可导性、牛顿-莱布尼茨公式。",
      "反常积分：无穷区间、无界函数、收敛判别与参数积分。",
      "定积分应用：面积、体积、弧长、旋转体、物理量和平均值。",
      "积分不等式与积分中值定理。"
    ],
    formulas: [
      "$\\int_a^b f(x)\\,dx=F(b)-F(a)$",
      "$\\frac{d}{dx}\\int_{\\alpha(x)}^{\\beta(x)}f(t)\\,dt=f(\\beta(x))\\beta'(x)-f(\\alpha(x))\\alpha'(x)$",
      "$\\int_0^a f(x)\\,dx=\\int_0^a f(a-x)\\,dx$。"
    ],
    problemTypes: [
      "不定积分计算：换元、分部、有理函数、三角恒等变形的组合。",
      "含参数积分：求导、讨论连续性或求参数使反常积分收敛。",
      "定积分技巧：对称性、周期性、区间再现、奇偶性、华里士型递推。",
      "变上限积分构造函数后求导，常与单调性、极值、方程根结合。",
      "反常积分收敛判别：比较、等价、$p$ 积分、指数衰减。",
      "几何应用：平面面积、旋转体体积、弧长和曲边梯形。",
      "积分不等式：利用单调性、凸性、积分中值定理或柯西不等式。"
    ],
    methods: [
      "不定积分先观察结构：复合函数导数在旁边用换元，乘积用分部。",
      "定积分先看区间和被积函数是否有奇偶、周期、对称中心。",
      "反常积分先找坏点：无穷远还是有限间断点，再局部比较。"
    ],
    pitfalls: [
      "分部积分的 $u$ 要越分越简单；若越分越复杂应换策略。",
      "变上限积分上下限都是函数时，不能漏乘链式导数。",
      "反常积分不能直接套牛顿-莱布尼茨，必须先取极限。"
    ]
  },
  {
    part: "高等数学",
    title: "向量代数与空间解析几何",
    slug: "math1-04-vector-geometry",
    summary: "用向量运算表达直线、平面、曲面与空间关系，为多元微积分铺路。",
    knowledge: [
      "向量线性运算：模、方向余弦、单位向量、投影。",
      "数量积：夹角、垂直、投影长度和功的几何意义。",
      "向量积：方向、面积、平行判定和法向量构造。",
      "混合积：体积、共面判定和有向体积。",
      "平面方程：点法式、一般式、截距式、三点式。",
      "空间直线：点向式、参数式、一般式和两平面交线。",
      "距离与夹角：点到平面、点到直线、异面直线距离、线面角、二面角。",
      "常见曲面：球面、柱面、锥面、旋转曲面、二次曲面。",
      "空间曲线：参数方程、投影曲线和切线/法平面。"
    ],
    formulas: [
      "$\\mathbf a\\cdot\\mathbf b=|\\mathbf a||\\mathbf b|\\cos\\theta$",
      "$|\\mathbf a\\times\\mathbf b|=|\\mathbf a||\\mathbf b|\\sin\\theta$",
      "点到平面距离：$d=\\frac{|Ax_0+By_0+Cz_0+D|}{\\sqrt{A^2+B^2+C^2}}$。"
    ],
    problemTypes: [
      "由点、方向向量、法向量求直线和平面方程。",
      "判断平行、垂直、共线、共面，并求夹角或距离。",
      "求异面直线公垂线、公垂距离和相关参数。",
      "识别二次曲面类型，把方程配方成标准形。",
      "求曲线在某点的切线、法平面或投影曲线。",
      "用向量积/混合积求面积、体积和几何证明。"
    ],
    methods: [
      "平面优先找法向量，直线优先找方向向量。",
      "距离题先判断对象关系：点面、点线、线线还是线面。",
      "二次曲面先配方，再看缺哪个变量、符号组合和截面形状。"
    ],
    pitfalls: [
      "两直线不平行不代表相交，空间中还可能异面。",
      "直线一般式是两个平面的交，不是一个方程。",
      "向量积方向要符合右手法则，符号错误会影响法向量方向。"
    ]
  },
  {
    part: "高等数学",
    title: "多元函数微分学",
    slug: "math1-05-multivariable-differential",
    summary: "围绕偏导数、全微分、梯度和极值，处理二元与多元函数局部变化。",
    surface: { expression: "x^2-y^2", range: "-3,3", title: "鞍面与方向变化" },
    knowledge: [
      "多元函数概念：定义域、邻域、区域、边界、二元函数图形。",
      "二重极限与连续：路径法、极坐标法、夹逼法和不存在判定。",
      "偏导数与高阶偏导数：定义、计算、混合偏导相等条件。",
      "全微分与可微：可微、偏导存在、连续偏导之间的关系。",
      "复合函数求导：链式法则、全导数和变量关系图。",
      "隐函数求导：一个方程、方程组和雅可比行列式条件。",
      "方向导数与梯度：最大增长方向、等值线法向量。",
      "多元泰勒公式：二阶主部与局部形状判断。",
      "无约束极值和条件极值：驻点、Hessian 判别、拉格朗日乘数法。"
    ],
    formulas: [
      "$dz=f_x(x,y)dx+f_y(x,y)dy$",
      "$D_{\\mathbf u}f=\\nabla f\\cdot\\mathbf u$",
      "二元极值判别：$D=f_{xx}f_{yy}-f_{xy}^2$。"
    ],
    problemTypes: [
      "判断二重极限存在：沿不同路径比较，或转极坐标估阶。",
      "求偏导、全微分、高阶偏导，常与复合函数链式法则结合。",
      "隐函数一阶/二阶偏导，尤其注意把其他变量视为常量。",
      "求方向导数、梯度、切平面和法线方程。",
      "无约束极值：求驻点，用 Hessian 判别。",
      "条件极值：构造拉格朗日函数，联立约束方程求解。",
      "几何应用：曲面切平面、等值面法向量和最速增长方向。"
    ],
    methods: [
      "多元极限不存在常用 $y=kx$、$y=x^2$、极坐标三类路径试探。",
      "复合求导先画依赖关系图，避免漏项。",
      "极值题先区分内部点、边界点和约束点。"
    ],
    pitfalls: [
      "偏导存在不一定连续，也不一定可微。",
      "方向导数定义中的方向向量必须单位化。",
      "拉格朗日乘数法只处理约束曲线/曲面上的候选点，端点或边界仍要单独看。"
    ]
  },
  {
    part: "高等数学",
    title: "多元函数积分学",
    slug: "math1-06-multivariable-integral",
    summary: "梳理二重、三重、曲线、曲面积分及三大公式，解决区域与场的计算。",
    surface: { expression: "exp(-(x^2+y^2))", range: "-3,3", title: "高斯曲面与积分区域" },
    knowledge: [
      "二重积分概念：几何意义、性质、直角坐标下的累次积分。",
      "二重积分换序：区域画图、投影法和分块。",
      "极坐标变换：雅可比 $r$、圆域、扇形域和旋转对称。",
      "三重积分：直角、柱面、球面坐标，质量与体积问题。",
      "第一类曲线/曲面积分：对弧长、对面积的积分。",
      "第二类曲线积分：对坐标的积分、方向性、保守场与路径无关。",
      "第二类曲面积分：通量、法向选择和有向曲面。",
      "格林公式、高斯公式、斯托克斯公式的条件、方向和边界关系。",
      "积分应用：面积、体积、质量、质心、转动惯量、功、环量、通量。"
    ],
    formulas: [
      "极坐标：$\\iint_D f(x,y)\\,dxdy=\\iint_{D'} f(r\\cos\\theta,r\\sin\\theta)r\\,drd\\theta$",
      "格林公式：$\\oint_L Pdx+Qdy=\\iint_D(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y})dxdy$",
      "高斯公式：$\\iint_\\Sigma P dydz+Q dzdx+R dxdy=\\iiint_\\Omega(P_x+Q_y+R_z)dV$。"
    ],
    problemTypes: [
      "二重积分计算：画区域、定次序、换序、极坐标。",
      "三重积分计算：选择柱面或球面坐标，注意雅可比。",
      "由积分限还原积分区域，再改换积分次序或坐标。",
      "第一类曲线/曲面积分：参数化后带入弧长元或面积元。",
      "第二类曲线积分：直接参数化、格林公式、路径无关。",
      "第二类曲面积分：投影法、高斯公式、补面技巧。",
      "综合应用：质心、转动惯量、功、通量和环量。"
    ],
    methods: [
      "先画区域再写限；区域越对称，越优先考虑极坐标、柱坐标或球坐标。",
      "曲线积分看到闭合曲线先想格林；曲面积分看到闭合曲面先想高斯。",
      "方向题先定正向：平面区域逆时针，曲面外法向，边界方向与法向匹配。"
    ],
    pitfalls: [
      "坐标变换不能漏雅可比。",
      "格林、高斯、斯托克斯都有光滑性和闭合/定向条件。",
      "补面后要减去补面的贡献，不能只算封闭体积分。"
    ]
  },
  {
    part: "高等数学",
    title: "无穷级数",
    slug: "math1-07-infinite-series",
    summary: "从数项级数到幂级数与傅里叶级数，掌握收敛判别和展开计算。",
    knowledge: [
      "数项级数概念：部分和、收敛、发散、必要条件。",
      "正项级数：比较、极限比较、比值、根值、积分判别。",
      "交错级数：莱布尼茨判别和余项估计。",
      "任意项级数：绝对收敛、条件收敛、重排问题。",
      "函数项级数：收敛域、和函数、逐项求导积分的条件直观。",
      "幂级数：收敛半径、收敛区间、端点判别。",
      "幂级数求和：由几何级数出发，逐项积分/求导。",
      "泰勒级数：常用函数展开、展开点变化和余项控制。",
      "傅里叶级数：周期延拓、正弦/余弦级数、收敛定理。"
    ],
    formulas: [
      "$\\sum ar^n$ 收敛当且仅当 $|r|<1$。",
      "$R=\\frac{1}{\\limsup\\sqrt[n]{|a_n|}}$ 或 $R=\\lim|\\frac{a_n}{a_{n+1}}|$。",
      "$e^x=\\sum_{n=0}^{\\infty}\\frac{x^n}{n!},\\ \\ln(1+x)=\\sum_{n=1}^{\\infty}(-1)^{n-1}\\frac{x^n}{n}$。"
    ],
    problemTypes: [
      "判断数项级数敛散性：先看通项极限，再选正项/交错/绝对收敛工具。",
      "含参数级数敛散性讨论，常要分临界参数。",
      "求幂级数收敛半径、区间，并单独检查端点。",
      "幂级数求和：先识别为已知级数的导数或积分。",
      "函数展开成幂级数，并确定适用区间。",
      "傅里叶级数展开，尤其是奇延拓、偶延拓和端点值。",
      "级数与积分、微分、极限结合的综合题。"
    ],
    methods: [
      "敛散性判别按顺序：必要条件、正项结构、绝对值、交错余项。",
      "幂级数端点永远单独代回原级数判断。",
      "求和函数时先把系数调整成 $\\sum x^n$、$\\sum nx^{n-1}$、$\\sum x^n/n$ 的形式。"
    ],
    pitfalls: [
      "通项趋于零只是必要条件，不是充分条件。",
      "比值判别极限等于 1 时失效。",
      "幂级数端点不能由半径直接判断。"
    ]
  },
  {
    part: "高等数学",
    title: "常微分方程",
    slug: "math1-08-ordinary-differential-equations",
    summary: "整理一阶、可降阶和二阶线性微分方程的解法及应用模型。",
    knowledge: [
      "微分方程基本概念：阶、通解、特解、初值条件。",
      "可分离变量方程和齐次方程。",
      "一阶线性方程与常数变易法。",
      "伯努利方程、全微分方程和积分因子思想。",
      "可降阶高阶方程：不显含 $y$ 或不显含 $x$ 的类型。",
      "二阶线性齐次方程：解结构、线性无关、朗斯基行列式。",
      "二阶常系数线性方程：特征方程与根的情况。",
      "非齐次方程：待定系数法、常数变易法。",
      "应用模型：增长衰减、冷却、混合、振动和电路模型。"
    ],
    formulas: [
      "一阶线性：$y'+P(x)y=Q(x)$，$y=e^{-\\int Pdx}(\\int Qe^{\\int Pdx}dx+C)$。",
      "二阶常系数齐次：$y''+py'+qy=0$ 对应特征方程 $r^2+pr+q=0$。",
      "非齐次通解：$y=y_h+y_p$。"
    ],
    problemTypes: [
      "识别微分方程类型并求通解、特解。",
      "含初值条件的方程求解，注意常数由初值确定。",
      "可降阶方程换元，如令 $p=y'$ 或把 $y'$ 看作 $y$ 的函数。",
      "二阶常系数非齐次方程，按右端类型选待定特解。",
      "应用题建模：根据变化率与状态量关系列方程。",
      "综合题：微分方程与积分、级数、极值条件结合。"
    ],
    methods: [
      "先看阶数和结构，再判断是否可分离、一阶线性或常系数线性。",
      "非齐次右端若与齐次解重复，特解要乘足够次的 $x$。",
      "应用模型先定义未知函数和单位，再翻译“变化率”。"
    ],
    pitfalls: [
      "通解中的任意常数个数应等于方程阶数。",
      "待定系数法只适合特定右端形式。",
      "分离变量时不要除以可能为零的解而漏掉特解。"
    ]
  },
  {
    part: "线性代数",
    title: "行列式",
    slug: "math1-09-determinants",
    summary: "掌握行列式性质、展开、计算与矩阵可逆性的连接。",
    knowledge: [
      "行列式定义：排列、逆序数、二阶三阶行列式。",
      "行列式性质：交换、倍乘、倍加、转置、线性性。",
      "按行列展开：代数余子式、余子式和拉普拉斯展开。",
      "三角化计算：初等变换与符号/倍数变化。",
      "范德蒙德行列式、分块行列式和递推行列式。",
      "克拉默法则及其适用条件。",
      "行列式与矩阵可逆、秩、特征值的关系。",
      "参数行列式的零点与方程组解的关系。"
    ],
    formulas: [
      "$|AB|=|A||B|,\\ |A^T|=|A|,\\ |A^{-1}|=|A|^{-1}$",
      "范德蒙德：$\\prod_{1\\le i<j\\le n}(x_j-x_i)$。",
      "$A$ 可逆 $\\Leftrightarrow |A|\\ne0$。"
    ],
    problemTypes: [
      "利用性质化三角形求行列式。",
      "含参数行列式求值或讨论何时为零。",
      "递推型、箭形、分块型行列式计算。",
      "代数余子式求和与伴随矩阵相关题。",
      "用克拉默法则讨论线性方程组唯一解。",
      "把行列式与特征值、秩、可逆性综合。"
    ],
    methods: [
      "行列式计算优先制造零，再按零多的行列展开。",
      "同型行列式考虑行列相加、递推或提取公共因子。",
      "含参数题先化简到因式分解形式。"
    ],
    pitfalls: [
      "行变换倍加不变，倍乘会使行列式同倍变化，交换变号。",
      "矩阵初等变换和行列式初等变换的影响不要混淆。",
      "克拉默法则只适用于系数行列式非零的方阵方程组。"
    ]
  },
  {
    part: "线性代数",
    title: "矩阵",
    slug: "math1-10-matrices",
    summary: "围绕矩阵运算、逆矩阵、初等变换、秩和分块矩阵建立计算基础。",
    knowledge: [
      "矩阵概念与运算：加法、数乘、乘法、转置、方阵幂。",
      "特殊矩阵：单位、零、对角、三角、对称、反对称、正交矩阵。",
      "逆矩阵：定义、性质、求法、可逆判定。",
      "伴随矩阵：$A^*$ 的定义与性质。",
      "初等变换与初等矩阵：左乘行变换、右乘列变换。",
      "矩阵秩：定义、等价标准、初等变换求秩。",
      "分块矩阵：分块乘法、分块求逆、分块行列式。",
      "矩阵方程：$AX=B$、$XA=B$、$AXB=C$。",
      "矩阵多项式和可逆性综合。"
    ],
    formulas: [
      "$(AB)^{-1}=B^{-1}A^{-1},\\ (AB)^T=B^TA^T$",
      "$AA^*=A^*A=|A|E$",
      "$r(A)=r(PAQ)$，其中 $P,Q$ 可逆。"
    ],
    problemTypes: [
      "矩阵运算与证明，尤其注意乘法不可交换。",
      "求逆矩阵：伴随法、初等变换法、分块法。",
      "讨论矩阵可逆、秩和参数取值。",
      "解矩阵方程，左乘或右乘逆矩阵注意顺序。",
      "伴随矩阵相关：行列式、秩、特征值联动。",
      "分块矩阵计算与秩等式证明。"
    ],
    methods: [
      "求逆优先用初等行变换 $[A\\mid E]\\to[E\\mid A^{-1}]$。",
      "秩题优先初等变换，参数题保留参数关键因子。",
      "矩阵方程先看未知矩阵左右两侧分别被谁乘。"
    ],
    pitfalls: [
      "矩阵乘法一般不可交换，消去和移项必须保持顺序。",
      "伴随矩阵性质在 $|A|=0$ 时仍要谨慎使用秩结论。",
      "初等行变换不保持矩阵特征值，但保持秩。"
    ]
  },
  {
    part: "线性代数",
    title: "向量",
    slug: "math1-11-vectors-linear-dependence",
    summary: "以线性相关、秩、基和坐标为主线，连接方程组和特征理论。",
    knowledge: [
      "n 维向量及其线性运算。",
      "线性组合、线性表示和向量组等价。",
      "线性相关与线性无关的定义、判定和性质。",
      "极大线性无关组、向量组秩和矩阵秩。",
      "向量空间、子空间、基、维数和坐标。",
      "过渡矩阵与坐标变换。",
      "内积、长度、正交、施密特正交化。",
      "正交矩阵与正交基。"
    ],
    formulas: [
      "向量组 $\\alpha_1,\\dots,\\alpha_s$ 线性相关 $\\Leftrightarrow k_1\\alpha_1+\\cdots+k_s\\alpha_s=0$ 有非零解。",
      "$r(\\alpha_1,\\dots,\\alpha_s)$ 等于极大无关组所含向量个数。",
      "施密特：$\\beta_k=\\alpha_k-\\sum_{i<k}\\frac{(\\alpha_k,\\beta_i)}{(\\beta_i,\\beta_i)}\\beta_i$。"
    ],
    problemTypes: [
      "判断向量组线性相关/无关，并求参数条件。",
      "求一个向量能否由另一组向量线性表示。",
      "求极大线性无关组与向量组秩。",
      "证明向量组等价、秩不等式或表示唯一性。",
      "求基、维数、坐标和过渡矩阵。",
      "施密特正交化与正交矩阵构造。"
    ],
    methods: [
      "向量组问题转成矩阵列向量问题，用初等行变换处理。",
      "线性表示问题等价于方程组是否有解。",
      "求坐标时把基向量作列，解 $Bx=\\alpha$。"
    ],
    pitfalls: [
      "向量个数大于维数一定相关，但小于等于维数不一定无关。",
      "行变换保持列向量组的线性关系判定，但变换后的列向量本身不是原向量。",
      "正交不等于标准正交，标准正交还要求长度为 1。"
    ]
  },
  {
    part: "线性代数",
    title: "线性方程组",
    slug: "math1-12-linear-systems",
    summary: "用秩、基础解系和通解结构统一齐次与非齐次线性方程组。",
    knowledge: [
      "齐次线性方程组的零解、非零解和基础解系。",
      "非齐次线性方程组的相容性与通解结构。",
      "系数矩阵、增广矩阵和秩判定。",
      "解空间维数：$n-r(A)$。",
      "基础解系求法：自由变量、主元变量和行最简形。",
      "非齐次通解：特解加齐次通解。",
      "含参数方程组的解的讨论。",
      "线性方程组与向量表示、矩阵可逆、克拉默法则的关系。"
    ],
    formulas: [
      "齐次有非零解 $\\Leftrightarrow r(A)<n$。",
      "非齐次有解 $\\Leftrightarrow r(A)=r(A\\mid b)$。",
      "非齐次通解：$x=x_0+c_1\\xi_1+\\cdots+c_{n-r}\\xi_{n-r}$。"
    ],
    problemTypes: [
      "判断方程组无解、唯一解、无穷多解。",
      "求齐次方程组基础解系和通解。",
      "求非齐次方程组特解与通解。",
      "含参数方程组分类讨论。",
      "由解的情况反求参数或矩阵秩。",
      "与向量组线性表示、极大无关组结合。"
    ],
    methods: [
      "统一用增广矩阵行化简，最后比较 $r(A)$ 和 $r(A|b)$。",
      "齐次方程先确定自由变量个数，再构造基础解系。",
      "参数题在化简过程中不要除以可能为零的参数表达式。"
    ],
    pitfalls: [
      "非齐次方程组的解集合不是向量空间。",
      "基础解系只针对齐次方程组。",
      "无穷多解要求有解且自由变量个数大于零。"
    ]
  },
  {
    part: "线性代数",
    title: "特征值与特征向量",
    slug: "math1-13-eigenvalues-eigenvectors",
    summary: "理解特征方程、相似、对角化和实对称矩阵，是线代综合题高频核心。",
    knowledge: [
      "特征值、特征向量定义与几何意义。",
      "特征多项式、特征方程和特征子空间。",
      "特征值性质：和为迹、积为行列式。",
      "相似矩阵：定义、性质和不变量。",
      "矩阵可对角化条件：线性无关特征向量个数。",
      "实对称矩阵：特征值实、不同特征值特征向量正交、正交对角化。",
      "矩阵幂和矩阵函数的对角化计算。",
      "相似与秩、行列式、迹、特征多项式的综合。"
    ],
    formulas: [
      "$A\\alpha=\\lambda\\alpha\\ (\\alpha\\ne0)$",
      "$|\\lambda E-A|=0$",
      "$A=PDP^{-1}\\Rightarrow A^n=PD^nP^{-1}$。"
    ],
    problemTypes: [
      "求特征值和特征向量。",
      "判断矩阵能否对角化，并求可逆矩阵 $P$。",
      "实对称矩阵正交对角化。",
      "利用特征值求行列式、迹、秩、矩阵幂。",
      "由给定特征值/特征向量反求矩阵参数。",
      "证明相似或不相似，寻找相似不变量。"
    ],
    methods: [
      "先求特征值，再逐个解 $(\\lambda E-A)x=0$。",
      "对角化的关键不是特征值个数，而是线性无关特征向量总数。",
      "实对称矩阵优先用正交对角化，特征向量要单位化。"
    ],
    pitfalls: [
      "重特征值不一定提供同样多个无关特征向量。",
      "行等价不保持特征值，相似才保持特征值。",
      "特征向量不能是零向量。"
    ]
  },
  {
    part: "线性代数",
    title: "二次型",
    slug: "math1-14-quadratic-forms",
    summary: "把二次型矩阵化，通过合同变换、正交变换和惯性指数判断正定性。",
    knowledge: [
      "二次型与对称矩阵表示。",
      "合同变换与矩阵合同。",
      "化二次型为标准形：配方法、初等变换法、正交变换法。",
      "规范形、秩、正惯性指数、负惯性指数。",
      "惯性定理：惯性指数在合同变换下不变。",
      "正定、负定、半正定、不定的定义。",
      "正定判别：特征值、顺序主子式、合同标准形。",
      "二次型与实对称矩阵特征值的关系。"
    ],
    formulas: [
      "$f=x^TAx$，其中 $A=A^T$。",
      "正定 $\\Leftrightarrow$ 所有特征值大于 0 $\\Leftrightarrow$ 顺序主子式全大于 0。",
      "合同变换：$A\\to C^TAC$。"
    ],
    problemTypes: [
      "写出二次型矩阵或由矩阵写二次型。",
      "化二次型为标准形/规范形，并求变换矩阵。",
      "判断正定性、半正定性或不定性。",
      "含参数二次型正定条件。",
      "用正交变换化二次型，并与特征值结合。",
      "求惯性指数、秩和标准形。"
    ],
    methods: [
      "含交叉项时矩阵对应元素取系数的一半。",
      "正定题优先看顺序主子式；实对称矩阵也可看特征值。",
      "标准形只关心平方项系数，规范形进一步化为 $1,-1,0$。"
    ],
    pitfalls: [
      "相似和合同不是一回事，二次型化简用合同。",
      "正定要求所有非零向量都使 $x^TAx>0$。",
      "主子式和顺序主子式在正定判别中不能混用。"
    ]
  },
  {
    part: "概率论与数理统计",
    title: "随机事件与概率",
    slug: "math1-15-events-probability",
    summary: "从事件运算、古典概型、条件概率到独立性，建立概率论语言。",
    knowledge: [
      "随机试验、样本空间、随机事件和事件关系。",
      "事件运算：并、交、差、对立、互斥、完备事件组。",
      "概率公理和基本性质。",
      "古典概型、几何概型和计数方法。",
      "条件概率、乘法公式、全概率公式。",
      "贝叶斯公式与后验概率。",
      "事件独立性：两事件、多事件、两两独立与相互独立。",
      "伯努利概型与二项概率。"
    ],
    formulas: [
      "$P(A|B)=\\frac{P(AB)}{P(B)}$",
      "$P(B)=\\sum_iP(A_i)P(B|A_i)$",
      "$P(A_i|B)=\\frac{P(A_i)P(B|A_i)}{\\sum_jP(A_j)P(B|A_j)}$。"
    ],
    problemTypes: [
      "事件关系化简与概率表达式计算。",
      "古典概型计数：排列组合、分组、至少/至多问题。",
      "条件概率、全概率、贝叶斯公式应用题。",
      "判断事件独立性或由独立性求概率。",
      "伯努利重复试验和二项概率。",
      "几何概型：长度、面积、体积比值。"
    ],
    methods: [
      "复杂事件先翻译成集合运算，再画文氏图或用对立事件。",
      "看到“已知发生”就是条件概率，看到“原因反推”就是贝叶斯。",
      "至少一个通常用对立事件更快。"
    ],
    pitfalls: [
      "互斥不等于独立；若 $P(A),P(B)>0$，互斥通常不独立。",
      "条件概率的样本空间已经改变。",
      "两两独立不能推出相互独立。"
    ]
  },
  {
    part: "概率论与数理统计",
    title: "一维随机变量及其分布",
    slug: "math1-16-one-dimensional-random-variable",
    summary: "整理离散型、连续型随机变量、分布函数、密度和常见分布。",
    knowledge: [
      "随机变量与分布函数 $F(x)$ 的定义和性质。",
      "离散型随机变量：分布律、常见离散分布。",
      "连续型随机变量：概率密度、分布函数、区间概率。",
      "常见分布：0-1、二项、泊松、几何、均匀、指数、正态。",
      "随机变量函数的分布：单调变换、分段变换。",
      "分位点和正态标准化。",
      "泊松近似二项分布、正态分布对称性。"
    ],
    formulas: [
      "$F(x)=P(X\\le x)$",
      "连续型：$P(a<X\\le b)=F(b)-F(a)=\\int_a^b f(x)dx$",
      "正态标准化：$Z=\\frac{X-\\mu}{\\sigma}\\sim N(0,1)$。"
    ],
    problemTypes: [
      "由分布律或密度求常数、概率和分布函数。",
      "由分布函数判断随机变量类型并求概率。",
      "常见分布参数识别与概率计算。",
      "求 $Y=g(X)$ 的分布函数或密度。",
      "正态分布标准化与查表型计算。",
      "含参数密度的归一化、分段积分和分布函数连续性。"
    ],
    methods: [
      "求函数分布统一从 $F_Y(y)=P(g(X)\\le y)$ 出发。",
      "连续型密度先检查非负和积分为 1。",
      "正态题先画区间，再标准化。"
    ],
    pitfalls: [
      "连续型随机变量单点概率为 0，但分布函数仍可能分段。",
      "密度函数不是概率，密度积分才是概率。",
      "分布函数必须右连续、单调不减且极限为 0 和 1。"
    ]
  },
  {
    part: "概率论与数理统计",
    title: "多维随机变量及其分布",
    slug: "math1-17-multidimensional-random-variables",
    summary: "处理联合分布、边缘分布、条件分布、独立性和二维变量函数分布。",
    knowledge: [
      "二维随机变量与联合分布函数。",
      "二维离散型：联合分布律、边缘分布、条件分布。",
      "二维连续型：联合密度、边缘密度、条件密度。",
      "随机变量独立性判定。",
      "二维均匀分布和二维正态分布的基本性质。",
      "随机变量函数分布：和、最大最小、商、线性组合。",
      "卷积公式和区域积分法。",
      "条件期望的初步计算。"
    ],
    formulas: [
      "$f_X(x)=\\int_{-\\infty}^{\\infty}f(x,y)dy$",
      "独立连续型：$f(x,y)=f_X(x)f_Y(y)$。",
      "和的密度：$f_Z(z)=\\int_{-\\infty}^{\\infty}f_X(x)f_Y(z-x)dx$。"
    ],
    problemTypes: [
      "由联合分布求边缘分布、条件分布和概率。",
      "判断 $X,Y$ 是否独立。",
      "二维连续型在区域上积分求概率。",
      "求 $Z=X+Y$、$Z=\\max(X,Y)$、$Z=\\min(X,Y)$ 的分布。",
      "二维离散型表格补全、求条件概率和期望。",
      "联合密度含参数时求参数并讨论独立性。"
    ],
    methods: [
      "二维连续型先画积分区域，再确定积分次序。",
      "独立性判定先求边缘，再看联合是否可分解。",
      "最大最小分布优先用事件等价：$\\max\\le z$、$\\min>z$。"
    ],
    pitfalls: [
      "边缘独立不由边缘分布相似推出，必须看联合分布。",
      "条件密度分母是边缘密度，且只在分母非零处有意义。",
      "卷积积分限来自两个密度同时非零的区间。"
    ]
  },
  {
    part: "概率论与数理统计",
    title: "随机变量的数字特征",
    slug: "math1-18-numerical-characteristics",
    summary: "系统整理期望、方差、协方差、相关系数和矩的计算与性质。",
    knowledge: [
      "数学期望定义、存在条件和线性性质。",
      "随机变量函数的期望：离散求和、连续积分。",
      "方差、标准差和常用公式。",
      "常见分布的期望与方差。",
      "协方差、相关系数和矩。",
      "独立性与不相关的关系。",
      "切比雪夫不等式。",
      "二维变量函数的期望与方差。"
    ],
    formulas: [
      "$D(X)=E(X^2)-[E(X)]^2$",
      "$Cov(X,Y)=E(XY)-E(X)E(Y)$",
      "$\\rho_{XY}=\\frac{Cov(X,Y)}{\\sqrt{D(X)}\\sqrt{D(Y)}}$。"
    ],
    problemTypes: [
      "由分布律、密度或分布函数求期望和方差。",
      "求 $E[g(X)]$、$E[g(X,Y)]$。",
      "常见分布数字特征直接识别。",
      "求协方差、相关系数并判断不相关。",
      "利用独立性计算和、差、线性组合的方差。",
      "切比雪夫不等式估计概率。"
    ],
    methods: [
      "方差优先用 $E(X^2)-[E(X)]^2$。",
      "独立时 $E(XY)=E(X)E(Y)$，但反过来不一定。",
      "线性组合方差注意协方差项。"
    ],
    pitfalls: [
      "期望存在需要绝对收敛或积分收敛条件。",
      "不相关不一定独立，正态场景下才常有特殊结论。",
      "方差不是线性的，不能把 $D(X+Y)$ 直接拆成 $D(X)+D(Y)$ 除非独立或协方差为零。"
    ]
  },
  {
    part: "概率论与数理统计",
    title: "大数定律与中心极限定理",
    slug: "math1-19-laws-large-numbers-clt",
    summary: "理解样本平均稳定性和标准化和的正态近似，解决极限概率问题。",
    knowledge: [
      "依概率收敛的直观含义。",
      "切比雪夫大数定律、伯努利大数定律、辛钦大数定律。",
      "独立同分布条件下样本均值的稳定性。",
      "中心极限定理：独立同分布情形。",
      "棣莫弗-拉普拉斯定理：二项分布正态近似。",
      "标准化处理和正态近似区间。",
      "大样本概率估计和误差控制。"
    ],
    formulas: [
      "$\\bar X_n\\xrightarrow{P}\\mu$",
      "$\\frac{\\sum_{i=1}^nX_i-n\\mu}{\\sqrt{n}\\sigma}\\Rightarrow N(0,1)$",
      "$\\frac{X-np}{\\sqrt{np(1-p)}}\\approx N(0,1)$。"
    ],
    problemTypes: [
      "用大数定律判断样本均值的概率极限。",
      "用中心极限定理近似计算和或平均值的概率。",
      "二项分布大样本正态近似。",
      "求样本量，使误差概率满足要求。",
      "切比雪夫不等式与大数定律结合。",
      "标准化后查正态分布函数。"
    ],
    methods: [
      "先确认独立同分布、期望和方差是否存在。",
      "和的题标准化用 $n\\mu$ 和 $\\sqrt n\\sigma$，平均值用 $\\mu$ 和 $\\sigma/\\sqrt n$。",
      "二项近似注意 $np$ 和 $n(1-p)$ 不能太小。"
    ],
    pitfalls: [
      "大数定律给的是收敛趋势，不是精确分布。",
      "中心极限定理需要标准化，不能直接说和服从标准正态。",
      "正态近似二项时连续性修正有时会影响精度。"
    ]
  },
  {
    part: "概率论与数理统计",
    title: "数理统计的基本概念",
    slug: "math1-20-statistics-basics",
    summary: "掌握总体、样本、统计量、抽样分布和三大常用分布。",
    knowledge: [
      "总体、个体、样本和简单随机样本。",
      "统计量定义：只依赖样本，不含未知参数。",
      "样本均值、样本方差、样本矩。",
      "经验分布函数和顺序统计量的基本直观。",
      "$\\chi^2$ 分布、$t$ 分布、$F$ 分布。",
      "正态总体下样本均值与样本方差的分布。",
      "抽样分布和独立性结论。",
      "样本矩与总体矩的关系。"
    ],
    formulas: [
      "$\\bar X=\\frac1n\\sum X_i,\\ S^2=\\frac1{n-1}\\sum(X_i-\\bar X)^2$",
      "若 $X_i\\sim N(\\mu,\\sigma^2)$，则 $\\frac{\\bar X-\\mu}{\\sigma/\\sqrt n}\\sim N(0,1)$。",
      "$\\frac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2(n-1)$。"
    ],
    problemTypes: [
      "判断某表达式是否为统计量。",
      "求样本均值、样本方差的期望和方差。",
      "正态总体下构造标准正态、卡方、t、F 分布变量。",
      "利用抽样分布计算概率或分位点。",
      "多个正态总体样本的独立性和分布组合。",
      "样本矩和顺序统计量的基础计算。"
    ],
    methods: [
      "看到正态总体，优先想样本均值、样本方差独立和三大分布。",
      "统计量不能含未知参数，这是判断题的第一标准。",
      "构造 t 分布时，分子标准正态，分母独立卡方除以自由度再开根。"
    ],
    pitfalls: [
      "样本方差定义通常用 $n-1$，不是 $n$。",
      "统计量可以含已知常数，但不能含未知参数。",
      "自由度不要漏减约束个数。"
    ]
  },
  {
    part: "概率论与数理统计",
    title: "参数估计",
    slug: "math1-21-parameter-estimation",
    summary: "整理矩估计、最大似然估计、估计量评价和正态总体区间估计。",
    knowledge: [
      "参数估计问题：点估计与区间估计。",
      "矩估计法：样本矩等于总体矩。",
      "最大似然估计：似然函数、对数似然、边界情形。",
      "估计量评价：无偏性、有效性、一致性。",
      "均方误差和方差比较。",
      "正态总体均值、方差的置信区间。",
      "单侧置信区间与双侧置信区间。",
      "估计与抽样分布的结合。"
    ],
    formulas: [
      "矩估计：$\\frac1n\\sum X_i^k=E(X^k)$。",
      "最大似然：$L(\\theta)=\\prod_{i=1}^n f(x_i;\\theta)$。",
      "无偏性：$E(\\hat\\theta)=\\theta$。"
    ],
    problemTypes: [
      "求矩估计量，常见于一参数或两参数分布。",
      "求最大似然估计，包含离散型和连续型。",
      "判断估计量是否无偏、比较有效性。",
      "求估计量的期望、方差和均方误差。",
      "正态总体均值或方差的置信区间。",
      "含边界参数的最大似然估计，如均匀分布端点。"
    ],
    methods: [
      "MLE 先写联合密度/概率，再取对数简化乘积。",
      "矩估计先写总体矩，再用样本矩替换。",
      "区间估计先找枢轴量，再套分位点。"
    ],
    pitfalls: [
      "最大似然估计不能只求导，必须检查参数范围和边界。",
      "无偏不代表方差小，有效性要在无偏估计量中比较。",
      "置信水平和显著性水平互补，双侧区间要用 $\\alpha/2$。"
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dateFor(index) {
  const date = new Date(today);
  date.setDate(today.getDate() - index);
  return date.toISOString().slice(0, 10);
}

function list(items) {
  return `<ul>\n${items.map((item) => `<li>${item}</li>`).join("\n")}\n</ul>`;
}

function section(title, items) {
  return `<h2>${escapeHtml(title)}</h2>\n${list(items)}`;
}

function surfaceBlock(surface) {
  if (!surface) return "";
  return `<h2>可交互数学模型</h2>
<p>这一章涉及局部形状或积分区域时，可以先旋转下面的曲面，观察图像如何对应公式中的变化。</p>
<div class="surface-widget" data-widget="surface" data-expression="${escapeHtml(surface.expression)}" data-range="${escapeHtml(surface.range)}" data-title="${escapeHtml(surface.title)}"></div>`;
}

function articleHtml(chapter, num) {
  return `<section class="study-widget study-widget--idea" data-widget="callout" data-type="idea" data-title="章节定位"><h4>章节定位</h4><p>${escapeHtml(chapter.summary)}</p></section>
${section("详细知识点清单", chapter.knowledge)}
${section("核心公式与结论", chapter.formulas)}
${section("详细题型", chapter.problemTypes)}
${surfaceBlock(chapter.surface)}
${section("解题路线", chapter.methods)}
${section("易错点", chapter.pitfalls)}
<h2>复习顺序建议</h2>
<ol>
<li>先把本章定义和适用条件背熟，尤其是定理的前提。</li>
<li>再做基础计算题，把公式变成稳定操作。</li>
<li>最后做综合题，训练“识别题型 - 选择工具 - 检查条件”的闭环。</li>
</ol>`;
}

function markdown(chapter, num) {
  const lines = [
    `[[callout:type=idea;title=章节定位]]`,
    chapter.summary,
    `[[/callout]]`,
    "",
    "## 详细知识点清单",
    ...chapter.knowledge.map((item) => `- ${item}`),
    "",
    "## 核心公式与结论",
    ...chapter.formulas.map((item) => `- ${item}`),
    "",
    "## 详细题型",
    ...chapter.problemTypes.map((item) => `- ${item}`),
    ""
  ];
  if (chapter.surface) {
    lines.push(
      "## 可交互数学模型",
      "这一章涉及局部形状或积分区域时，可以先旋转下面的曲面，观察图像如何对应公式中的变化。",
      "",
      `[[surface:function=${chapter.surface.expression};range=${chapter.surface.range};title=${chapter.surface.title}]]`,
      ""
    );
  }
  lines.push(
    "## 解题路线",
    ...chapter.methods.map((item) => `- ${item}`),
    "",
    "## 易错点",
    ...chapter.pitfalls.map((item) => `- ${item}`),
    "",
    "## 复习顺序建议",
    "1. 先把本章定义和适用条件背熟，尤其是定理的前提。",
    "2. 再做基础计算题，把公式变成稳定操作。",
    "3. 最后做综合题，训练“识别题型 - 选择工具 - 检查条件”的闭环。"
  );
  return lines.join("\n");
}

function noteHtml(metadata, article, markdownText) {
  const sourcePayload = JSON.stringify({ metadata, markdown: markdownText, html: article }, null, 2).replace(/<\/script/gi, "<\\/script");
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metadata.title)} | 数学 | Tumy Study</title>
  <meta name="description" content="${escapeHtml(metadata.summary)}">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="stylesheet" href="/study/assets/study.css">
</head>
<body class="study-reader" data-page="note">
  <canvas class="study-canvas" aria-hidden="true"></canvas>
  <main class="study-shell">
    <nav class="study-nav" aria-label="页面导航">
      <a class="study-brand" href="/study/"><span class="study-brand__mark">S</span><span>Tumy Study</span></a>
      <div class="study-nav__links">
        <a class="study-pill" href="/study/math/">返回数学</a>
        <a class="study-pill" href="/study/">学习主页</a>
      </div>
    </nav>
    <section class="reader-wrap">
      <article class="reader-card">
        <span class="reader-kicker">考研数学一 / ${escapeHtml(metadata.part)}</span>
        <h1>${escapeHtml(metadata.title)}</h1>
        <p class="reader-lead">${escapeHtml(metadata.summary)}</p>
        <p class="reader-date">${metadata.displayDate}</p>
        <div class="article">${article}</div>
      </article>
      <aside class="reader-aside">
        <div class="reader-card">
          <strong>目录</strong>
          <ul class="toc-list" data-toc></ul>
        </div>
        <div class="reader-card">
          <strong>说明</strong>
          <p>按考研数学一复习框架整理，覆盖知识点、常见题型、解题路线和易错点。</p>
        </div>
      </aside>
    </section>
  </main>
  <script type="application/json" id="study-note-source">${sourcePayload}</script>
  <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <script src="/study/assets/study.js"></script>
</body>
</html>`;
}

await fs.rm(path.join(studyRoot, "math", "new-study-note"), { recursive: true, force: true });
await fs.rm(path.join(studyRoot, "math", "limit-surface"), { recursive: true, force: true });
await fs.rm(path.join(studyRoot, "control", "feedback-basics"), { recursive: true, force: true });

const notes = [];

for (const [index, chapter] of chapters.entries()) {
  const num = index + 1;
  const date = dateFor(index);
  const metadata = {
    title: `${String(num).padStart(2, "0")} ${chapter.title}`,
    subject: "math",
    part: chapter.part,
    summary: chapter.summary,
    date,
    displayDate: date.replace(/-/g, "/"),
    slug: chapter.slug,
    coverSeed: chapter.slug,
    url: `/study/math/${chapter.slug}/`
  };
  const article = articleHtml(chapter, num);
  const markdownText = markdown(chapter, num);
  const dir = path.join(studyRoot, "math", chapter.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), noteHtml(metadata, article, markdownText), "utf8");
  notes.push({
    title: metadata.title,
    subject: metadata.subject,
    part: metadata.part,
    summary: metadata.summary,
    date: metadata.date,
    slug: metadata.slug,
    coverSeed: metadata.coverSeed,
    url: metadata.url
  });
}

await fs.writeFile(path.join(studyRoot, "data", "notes.json"), `${JSON.stringify({ notes }, null, 2)}\n`, "utf8");

console.log(`Generated ${notes.length} math-one notes.`);
