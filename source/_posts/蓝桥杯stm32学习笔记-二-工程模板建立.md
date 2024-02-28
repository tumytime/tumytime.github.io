---
title: 蓝桥杯stm32学习笔记(二):工程模板建立
date: 2024-02-28 14:14:34
tags: [嵌入式 ,stm32,蓝桥杯]
categories: 嵌入式
swiperImg: https://tumytime.github.io/picx-images-hosting/20240205/Screenshot_20240205_223525.11l7h2o44fzk.webp
bgImg: https://tumytime.github.io/picx-images-hosting/20240205/9f2685b1e4401ff98ae648edd1cb8866.39vtcqu2gu60.webp
top: true
---
{% note info, 开发板芯片：stm32g4rbt6;HAL库开发 %}
{% timeline %}

{% timenode 第一步 [新建工程](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

{%image https://tumytime.github.io/picx-images-hosting/image.3ye6m3fcyj.webp  %}

{% endtimenode %}

{% timenode 第二步 [选择芯片](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

{%image https://tumytime.github.io/picx-images-hosting/image.7w6k2rzwfo.webp %}
然后右上角"Start Project"
{% endtimenode %}

{% timenode 第三步 [打开高速外部时钟](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

{%image https://tumytime.github.io/picx-images-hosting/image.2krni340qq.webp  %}
{% folding open, 详细介绍 %}

{% folding, System Core %}

"System Core"（系统核心）是指计算机系统或嵌入式系统中的主要核心部分，负责执行系统的基本功能和控制整体系统的运行。在嵌入式系统中，System Core通常是指主控制器或主处理器（MCU/Microcontroller、CPU）以及与之相关的关键功能模块，如时钟系统、存储器管理、中断控制、通信接口等。


1. **DMA (Direct Memory Access)**:
   - **作用**：DMA是一种数据传输技术，允许外设在不干扰CPU的情况下直接访问系统内存。
   
2. **GPIO (General Purpose Input/Output)**:
   - **作用**：GPIO是通用输入输出，用于连接和控制外部设备，例如传感器、执行器等。
  
3. **IWDG (Independent Watchdog)**:
   - **作用**：IWDG是一个独立的看门狗定时器，用于监控系统崩溃或卡死的情况，并在检测到问题时采取相应的措施。
  
4. **NVIC (Nested Vector Interrupt Controller)**:
   - **作用**：NVIC是用于管理中断请求及优先级的控制器，负责处理系统中的各种中断事件。
  
5. **RCC (Reset and Clock Control)**:
   - **作用**：RCC用于控制系统的复位和{% pbg info, 时钟设置 %}，包括配置处理器的工作频率和外设时钟等。

6. **SYS（System）**:
   - **作用**：系统核心，通常指嵌入式系统中的主要功能模块，包括系统时钟、复位、中断控制等核心功能。

7. **WWDG (Window Watchdog)**:
   - **作用**：WWDG是一种看门狗定时器，专用于监测特定时间范围内的系统操作，确保系统在规定的时间内正常运行。

RCC和SYS里都有时钟，他们的区别：
```
在嵌入式系统中，RCC（Reset and Clock Control）和SYS（System）这
两个模块通常负责系统的时钟控制和核心功能管理，它们之间的主要区别在
于功能和职责上的不同：

1. RCC（Reset and Clock Control）：
   - RCC模块主要负责系统的时钟控制和管理，包括配置各种时钟源、设置
   时钟分频器、选择系统时钟源、控制时钟输出等功能。
   - RCC模块的重点在于处理系统的时钟信号，确保系统各个部分按时钟信
   号同步工作，保证系统的稳定性和性能。
   - RCC通常用于对系统的时钟进行配置和管理，以确保系统各个模块能够
   按照正确的时钟信号工作。

2. SYS（System）：
   - SYS模块通常是指嵌入式系统中的主要功能模块，包括系统核心功能、
   复位控制、中断处理、时钟初始化等。
   - SYS模块的职责更多是系统的整体管理和控制，包括处理系统级的复位
   请求、配置系统核心功能模块、管理中断控制器等。
   - SYS模块通常负责系统的初始化和管理工作，确保系统各个模块正常工
   作，实现系统的整体功能。

总的来说，RCC（时钟控制）主要处理系统的时钟信号，而SYS（系统）则更
多涉及系统的核心功能和整体管理。在系统设计和开发中，这两个模块通常
需要协同工作，以确保系统的时钟正常运行并管理系统的核心功能模块。
```

{% endfolding %}

{% folding, 时钟选择原因 %}
高速时钟(HSE和HSI)提供给芯片主体的主时钟.低速时钟(LSE和LSI)只是提供给芯片中的RTC(实时时钟)及独立看门狗使用
- 选择High Speed Clock (HSE) 作为单片机的时钟源有以下几个常见原因：

    1. 高性能：High Speed Clock (HSE) 具有较高的时钟频率，适用于需要高性能处理的应用，例如高速数据处理、高速通信等。高速时钟可以提高系统的运行速度和响应能力。

    2. 灵活性：HSE 可以提供多种可选择的时钟频率，用户可以根据实际应用的需要进行灵活配置。通过选择适合的时钟频率，可以更好地优化系统性能。

    3. 高精度：HSE 通常具有较高的时钟精度和稳定性，适用于对时钟要求严格的应用，例如需要高精度测量或同步的系统。

    4. 外设兼容性：一些外部设备或模块可能要求使用高速时钟，因此选择HSE 可以更好地与这些外设兼容，确保系统稳定运行。

    5. 高速通信：在需要进行高速数据传输或通信的场景中，选择HSE 可以更好地满足通信的需求，确保数据传输的稳定性和速度。

- 选择Crystal/Ceramic Resonator的原因：

    1. 稳定性：Crystal/Ceramic Resonator 提供了比普通晶体振荡器更高的稳定性和精度。这对于需要精确时钟的应用非常重要，如通讯系统、精密测量仪器等。

    2. 抗干扰性：Crystal/Ceramic Resonator 在晶体振荡器中包裹了陶瓷封装，可以有效地抵抗外部干扰和振荡器的温度变化。这使得它在工作时更加稳定可靠。

    3. 频率精度：Crystal/Ceramic Resonator 可以提供非常精确的频率输出，通常具有很小的频率误差，满足一些对时钟频率要求非常高的应用。

    4. 适用范围广：Crystal/Ceramic Resonator 可以满足多种时钟频率的需求，可以选择不同的晶振频率来适应不同的应用场景。

{% endfolding %}

{% folding, 配置完后右边两个引脚自动使能 %}
{%image https://tumytime.github.io/picx-images-hosting/image.7p10w38yw.webp  %}

在这里，RCC_OSC_IN 和 RCC_OSC_OUT 是指单片机（通常是指的STM32系列单片机）的时钟源输入和输出引脚。这两个引脚通常用于连接外部晶振或者外部时钟源，以提供系统的时钟。

- RCC_OSC_IN 是指单片机的外部时钟源输入引脚，用于连接外部晶振或者外部时钟源。这个引脚接收外部时钟信号，将其传递给单片机的时钟模块，用作系统时钟源。

- RCC_OSC_OUT 是指单片机的外部时钟源输出引脚，通常在使用外部晶振时，此引脚为晶振输出引脚。通过此引脚可以输出晶振的时钟信号，连接到其他外部设备或者模块中。

“OSC”通常是“oscillator（振荡器）”的缩写。在电子领域，振荡器是一种电路或设备，用于在没有外部激励的情况下产生周期性的信号或波形。这种周期性的信号通常用于驱动其他电路或设备，例如用作时钟信号或者同步信号。

振荡器在电子设备中起到非常重要的作用，特别是在数字系统中，振荡器通常用来提供系统时钟。一些常见的振荡器类型包括晶体振荡器（Crystal oscillator）、陶瓷谐振器（Ceramic resonator）、RC振荡器（RC oscillator）等。

晶体振荡器是最常见的一种振荡器，使用晶体作为振荡元件，提供高精度和稳定的时钟信号。陶瓷谐振器通常比晶体振荡器便宜，但精度和稳定性可能没有晶体振荡器好。而RC振荡器则使用电阻和电容构成简单的振荡电路，适用于一些低要求的应用。

因此，当提到“OSC”时，通常是指一个振荡器或者相关的振荡器电路。
{% endfolding %}

{% endfolding %}


{% endtimenode %}

{% timenode 第四步 [配置时钟树](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

{%image https://tumytime.github.io/picx-images-hosting/image.1754e4p6ge.webp   %}
第④步写入80后按回车键，其他项自动配置

{% folding open, 详细介绍 %}

{% link STM32的5个时钟源知识, https://zhuanlan.zhihu.com/p/138661512, https://pic1.zhimg.com/80/v2-0ba05516dcec7c23fc5365e31015a938_720w.webp %}
众所周知STM32有5个时钟源HSI、HSE、LSI、LSE、PLL，其实他只有四个，因为从上图中可以看到PLL都是由HSI或HSE提供的。

　　其中，高速时钟(HSE和HSI)提供给芯片主体的主时钟.低速时钟(LSE和LSI)只是提供给芯片中的RTC(实时时钟)及独立看门狗使用，图中可以看出高速时钟也可以提供给RTC。

　　内部时钟是在芯片内部RC振荡器产生的，起振较快，所以时钟在芯片刚上电的时候，默认使用内部高速时钟。而外部时钟信号是由外部的晶振输入的，在精度和稳定性上都有很大优势，所以上电之后我们再通过软件配置，转而采用外部时钟信号.

{% folding , ① Input frequency  %}

{% pbg info,就是（一）中写到的晶振频率（24MHz） %}
在单片机或微控制器的时钟树中，input frequency指的是作为时钟源输入到微控制器的时钟信号的频率。这个输入频率通常是外部提供的，并且可以是一个稳定的振荡器输出，比如晶体振荡器或者陶瓷谐振器输出的频率。

时钟信号的频率对于单片机的正常运行非常重要，因为它们用来控制单片机内部各个模块的操作和时序。单片机的内部时钟系统会通过时钟树将外部输入的时钟信号进行分频、倍频等处理，以产生用于不同模块的时钟信号。

在设计单片机系统时，需要根据单片机器件规格书提供的要求来选择适合的input frequency。不同的单片机可能对时钟信号的输入频率有不同的要求，一般会有最小和最大的输入频率范围。选择恰当的输入频率可以确保单片机正常运行并获得最佳性能。

{% endfolding %}

{% folding , ② PLL Source Mux %}
- PLL source Mux是指在一些带有PLL（Phase-Locked Loop，相位锁定环）的芯片中的一个功能模块。PLL source Mux通常是一个用于选择PLL输入源的多路复用器（Mux，Multiplexer），允许用户从多个不同的时钟源中选择一个作为PLL的输入源。

在数字电路设计中，PLL被用来产生一个稳定的、精确的时钟信号。通过调节PLL的反馈回路，可以使得PLL的输出时钟频率与输入时钟频率保持精确的整数倍关系。PLL source Mux的作用是允许用户选择不同的输入时钟源，这样可以在不同的工作模式下选择最适合的时钟源，从而调整PLL的工作频率或者其他参数。

通过PLL source Mux，用户可以灵活地选择外部时钟源、内部时钟源或者其他信号源作为PLL的输入信号，以满足不同的应用需求。这样就实现了在同一芯片内部对时钟输入源进行切换和选择的功能。

- HSI振荡器与HSE的区别就在于一个是内部的时钟源，一个是外部的时钟源，Inside与External。

{% endfolding %}

{% folding , ③ System Clock Mux %}
在选择时钟源时需要考虑系统的性能需求和功耗优化等因素。在HSI（High-Speed Internal），HSE（High-Speed External），和PLLCLK（Phase-Locked Loop Clock）这三个选项中选择PLLCLK的原因可以包括以下几点：

1. 高性能：PLLCLK通过锁相环技术可以生成高频率的稳定时钟信号，通常可以提供比HSI和HSE更高的时钟频率。这在一些高性能需求的系统中是非常重要的。

2. 灵活性：选择PLLCLK作为系统时钟源可以提供更大的灵活性，可以通过设置PLL的分频器和倍频器来满足系统对时钟频率的特定需求，从而在不同场景下灵活调整系统的性能指标。

3. 容错性：PLLCLK可以通过外部时钟源（如晶振）提供更好的抗干扰性能，因此在一些对系统稳定性有要求的场合，选择PLLCLK作为时钟源可能更为合适。


{% endfolding %}

{% folding , ④ HCLK %}
{% pbg info,范围内都可以，但是蓝桥杯官方例程中一般设为80 %}
HCLK是嵌入式系统中常见的一个术语，指的是主系统时钟（Master Clock），也称为主总线时钟（Master Bus Clock）。HCLK是处理器核心和大多数系统总线和外设的主要工作时钟，控制系统中大多数部件的操作，用于同步各个部件的工作。在嵌入式系统中，HCLK的频率通常是其他外设时钟频率的倍数。
{% endfolding %}

{% endfolding %}

{% endtimenode %}

{% timenode 第五步 [调试接口选择](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}
{%image https://tumytime.github.io/picx-images-hosting/image.lvgru965c.webp   %}


{% folding open, 详细介绍 %}
在单片机的系统配置中，选择使用Serial Wire（串行线）进行调试有以下几个主要原因：

1. **简化连接**: Serial Wire Debug（SWD）是一种只需使用两根线（SWDIO和SWCLK）即可进行调试的接口，相比于JTAG接口需要更多的引脚和连接线，使用Serial Wire可以减少连接布线的复杂性。

2. **性能优势**: 由于JTAG接口需要更多的引脚和数据线，可能会产生一些性能瓶颈。相比之下，Serial Wire接口更为简单，可以提供更高的性能。

3. **低功耗**: Serial Wire接口通常比JTAG接口消耗更少的功耗，这对于嵌入式系统中对功耗要求较高的场景非常重要。

4. **占用资源少**: Serial Wire接口占用的资源较少，对于一些资源受限的嵌入式系统来说，这是一个重要考虑因素。

综上所述，选择在单片机系统配置中使用Serial Wire接口进行调试，可以提供更简单、高效、低功耗的调试方案，同时避免了一些潜在的问题和限制。
{% endfolding %}

{% endtimenode %}

{% timenode 第六步 [保存工程](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

- {%image https://tumytime.github.io/picx-images-hosting/image.7egieb8qmz.webp  %}
- {%image https://tumytime.github.io/picx-images-hosting/image.92pvbi2i5d.webp   %}

{% endtimenode %}

{% timenode 第七步 [生成工程](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

点击右上角"GENERATE CODE",生成工程

{% endtimenode %}

{% endtimeline %}
打开文件：
{%image https://tumytime.github.io/picx-images-hosting/image.7zq60mkhq1.webp  %}
{% timeline %}

{% timenode 第一步 [编译文件](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

{%image https://tumytime.github.io/picx-images-hosting/image.3uukois684.webp  %}

{% note warning, 你的代码一定要写在"begin"和"end"之间，不然下一次生成工程会被覆盖掉 %}

{%image  https://tumytime.github.io/picx-images-hosting/image.1zhzvwjff4.webp   %}

{% endtimenode %}

{% timenode 第二步 [选择调试器](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}
选择的就是板载调试器
- {%image https://tumytime.github.io/picx-images-hosting/image.ibuu5mnx2.webp  %}
- {%image https://tumytime.github.io/picx-images-hosting/image.2vehbd3ej7.webp  %}


{% endtimenode %}

{% timenode 第三步 [根目录新建bsp文件夹](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}
放自己写的文件(bsp:板载支持包，代码在这块板子使用)
{%image https://tumytime.github.io/picx-images-hosting/image.32hp6st6bo.webp %}

{% endtimenode %}
{% timenode 第四步 [工程目录新建bsp文件夹](https://tumytime.space/2024/02/28/%E8%93%9D%E6%A1%A5%E6%9D%AFstm32%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0-%E4%BA%8C-%E5%B7%A5%E7%A8%8B%E6%A8%A1%E6%9D%BF%E5%BB%BA%E7%AB%8B/) %}

- {%image https://tumytime.github.io/picx-images-hosting/image.1ses0hevyf.webp   %}
- {%image https://tumytime.github.io/picx-images-hosting/image.3rayqtnetn.webp  %}

{% endtimenode %}

{% endtimeline %}

完结撒花~