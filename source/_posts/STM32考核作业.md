---
title: STM32考核作业
tags: [嵌入式 ,stm32,蓝桥杯]
categories: 嵌入式
swiperImg: https://tumytime.github.io/picx-images-hosting/20240205/Screenshot_20240205_223525.11l7h2o44fzk.webp
bgImg: https://tumytime.github.io/picx-images-hosting/20240205/9f2685b1e4401ff98ae648edd1cb8866.39vtcqu2gu60.webp
top: true
---

{% note info, 开发板芯片：stm32g4rbt6;HAL库开发 %}
{% folding open, 题目 %}

1.	定义一个按键1，切换屏幕显示模式，屏幕有三种模式，第一个显示当前呼吸灯的占空比的值，第二个显示用电位器R37调节输出信号占空比的值，第三个是记录状态：显示呼吸灯和电位器记录时的pwm值，处于记录状态时，电位器的输出信号不会被改变
2.	切换led模式，
    1) LD1:处于呼吸灯pwm界面，指示灯LD1点亮，否则熄灭。
    2) LD2: 处于电位器pwm界面，指示灯LD2以0.5秒为间隔切换亮、灭状态。
    3) LD3:处于记录状态时，指示灯LD3点亮，否则熄灭。
    4) LD4-LD8指示灯始终处于熄灭状态。
3.	定义一个按键2，可以记录当前pwm值，记录当前时间的呼吸灯和电位器的值，在记录状态时会将记录的值显示在屏幕上
4.	接通电源后呼吸灯亮灭循环三个次，以后呼吸灯不需要亮，但是要可以正常读到呼吸灯的pwm值

{% endfolding %}

{% video  /video/6FE627A7523A362DFBDAFF2659AAA047.mp4 %}
{% folding open, 我的解答（反正都实现了） %}
目录
{%image https://tumytime.github.io/picx-images-hosting/image.92pvbkg3ve.webp %}

{% folding open, main.c %}
```
/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2023 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "adc.h"
#include "tim.h"
#include "gpio.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "lcd.h"
#include "led.h"
#include "interrupt.h"
#include "aadc.h"
#include "stdio.h"
#include "string.h"
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */
extern struct keys key[];
//extern unsigned int ccrl_val1,ccrl_val2,frq1, frq2;
int DutyCycle2,DutyCycle3;

unsigned char  view=0;
uint32_t	tempCnt=0;
/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */
void key_proc();
void disp_proc(uint32_t i);
/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  /* USER CODE BEGIN 1 */
	uint32_t temp_pwm,i;
//uint32_t	tempCnt=0;
  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */
	HAL_SYSTICK_Config(80000000/1000);
  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_TIM3_Init();
  MX_TIM4_Init();
  MX_ADC2_Init();
  MX_TIM16_Init();
  MX_TIM8_Init();
  /* USER CODE BEGIN 2 */
	/**********初始化**********/
//	LED_Disp(0x00);//LED的初始化
//	LCD_Init();//LCD屏的初始化
	/**********初始化**********/

	/**********LED颜色**********/
	LCD_SetBackColor(Black );
	LCD_SetTextColor(White);
	/**********LED颜色**********/


	HAL_TIM_PWM_Start_IT(&htim3,TIM_CHANNEL_3);
	HAL_TIM_PWM_Start_IT(&htim16,TIM_CHANNEL_1);

//HAL_TIM_Base_Start_IT(&htim3 );
	HAL_TIM_Base_Start_IT(&htim4 );

	HAL_TIM_IC_Start_IT (&htim3,TIM_CHANNEL_1);
	HAL_TIM_IC_Start_IT (&htim8,TIM_CHANNEL_1);

	int w;
	int count=0;

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
	while (1) {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
//			LED_Disp(0x00);//LED的初始化


		count++;
		if(count==4) {
			LCD_Init();//LCD屏的初始化
		}
		for(w=0; w<1000; w+=1) {

			TIM3->CCR3 = w;
			key_proc();
//			if(key[2].single_flag==0) {
				disp_proc(w);
//			}
			HAL_Delay(1);

		}
		for (w=1000; w>0; w-=1) {
			TIM3->CCR3 = w;
			key_proc();
//			if(key[2].single_flag==0) {
				disp_proc(w);
//			}
			HAL_Delay(1);

		}

	}
  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure the main internal regulator output voltage
  */
  HAL_PWREx_ControlVoltageScaling(PWR_REGULATOR_VOLTAGE_SCALE1);

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLM = RCC_PLLM_DIV3;
  RCC_OscInitStruct.PLL.PLLN = 20;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV2;
  RCC_OscInitStruct.PLL.PLLQ = RCC_PLLQ_DIV2;
  RCC_OscInitStruct.PLL.PLLR = RCC_PLLR_DIV2;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/* USER CODE BEGIN 4 */

/**********按键1切换屏幕显示模式**********/

void key_proc() {
	if(key[0].single_flag==1) {

		if(view==3) {
			view=0;
		}
		view++;
		LCD_Init();//LCD屏的初始化
		LCD_Clear(Black );

		key[0].single_flag=0;
	}

	if(key[1].single_flag==1) {
		DutyCycle2 = (TIM3->CCR3+1)/(TIM3->CCR4 + 1)-1;
		DutyCycle3 = (TIM16->CCR1+1)/(TIM16->CCR2 + 1)-1;


		key[1].single_flag=0;
	}
}

void disp_proc(uint32_t i) {
	if(view==1) {

//		LCD_Init();//LCD屏的初始化
//	LED_Disp(0x00);//LED的初始化
//		LCD_Clear(Black);
		led(1,1);
		led(3,0);

		int DutyCycle = (TIM3->CCR3+1)/(TIM3->CCR4 + 1);

		int m=i/10;
		char text1[30];
		snprintf(text1,30,"       Breath       ");
		LCD_DisplayStringLine(Line1,(uint8_t *)text1);

		char texta[30];
		snprintf(texta,30,"   Duty_ratio:%d%%   ",DutyCycle/10);
		LCD_DisplayStringLine(Line5,(uint8_t *)texta);
	}
	if(view==2) {
//					LED_Disp(0x00);//LED的初始化
//		HAL_StatusTypeDef HAL_TIM_PWM_Stop_IT(&htim3,TIM_CHANNEL_3);


//		LCD_Clear(Black);

		char text2[30];
		snprintf(text2,30,"         R37        ");
		LCD_DisplayStringLine(Line1,(uint8_t *)text2);


		int n=100*(1-(getADC (&hadc2)/3.25));
		TIM16->CCR1 = n;
		int DutyCycle = (TIM16->CCR1+1)/(TIM16->CCR2 + 1)-1;
		char textb[30];
		snprintf(textb,30,"   Duty_ratio:%d%%  ",DutyCycle);
		LCD_DisplayStringLine(Line5,(uint8_t *)textb);
		/**********led闪烁**********/
		led(1,0);
		if(HAL_GetTick()-tempCnt>500) {
			HAL_GPIO_TogglePin (GPIOC,GPIO_PIN_9);
			tempCnt =HAL_GetTick();
		}
		/**********led闪烁**********/



	}
	if(view==3) {
//					LED_Disp(0x00);//LED的初始化
		led(2,0);
		led(3,1);

		char text2[30];
		snprintf(text2,30,"       Record       ");
		LCD_DisplayStringLine (Line1,(uint8_t *)text2);

//		int DutyCycle1 = (TIM16->CCR1+1)/(TIM16->CCR2 + 1)-1;


//		int m=i/10;
//		LCD_Clear(Black);
		char textb[30];
		snprintf(textb,30,"      Breath:%d%%     ",DutyCycle2/10 );
		LCD_DisplayStringLine(Line4,(uint8_t *)textb);

		char textc[30];
		snprintf(textc,30,"       R37:%d%%       ",DutyCycle3 );
		LCD_DisplayStringLine(Line6,(uint8_t *)textc);
	}

}

/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
	/* User can add his own implementation to report the HAL error return state */
	__disable_irq();
	while (1) {
	}
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
	/* User can add his own implementation to report the file name and line number,
	   ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */


```
{% endfolding %}

{% folding open, led %}


{% folding open, led.h %}
```
#ifndef _LED_H_
#define _LED_H_

#include "main.h"

void led(int x,int a);
void LED_Disp(unsigned char dsLED);
#endif
```
{% endfolding %}

{% folding open, led.c %}
```
#include "led.h"

void led(int x,int a)
{
	int pin;
	switch(x)
	{
		case 1:pin=GPIO_PIN_8;break;
		case 2:pin=GPIO_PIN_9;break;
		case 3:pin=GPIO_PIN_10;break;
		case 4:pin=GPIO_PIN_11;break;
		case 5:pin=GPIO_PIN_12;break;
		case 6:pin=GPIO_PIN_13;break;
		case 7:pin=GPIO_PIN_14;break;
		case 8:pin=GPIO_PIN_15;break;
		
	}
		if(a==0)	HAL_GPIO_WritePin(GPIOC,pin,GPIO_PIN_SET);
		if(a==1)	HAL_GPIO_WritePin(GPIOC,pin,GPIO_PIN_RESET);

	
	
		HAL_GPIO_WritePin(GPIOD,GPIO_PIN_2,GPIO_PIN_SET);
		HAL_GPIO_WritePin(GPIOD,GPIO_PIN_2,GPIO_PIN_RESET);

	
}
void LED_Disp(unsigned char dsLED)
{
		HAL_GPIO_WritePin(GPIOC,GPIO_PIN_8,GPIO_PIN_SET );
	  HAL_GPIO_WritePin(GPIOC,GPIO_PIN_9,GPIO_PIN_SET );
		HAL_GPIO_WritePin(GPIOC,GPIO_PIN_10,GPIO_PIN_SET );
		HAL_GPIO_WritePin(GPIOC,GPIO_PIN_11,GPIO_PIN_SET );
		HAL_GPIO_WritePin(GPIOC,GPIO_PIN_12,GPIO_PIN_SET );
		HAL_GPIO_WritePin(GPIOC,GPIO_PIN_13,GPIO_PIN_SET );
		HAL_GPIO_WritePin(GPIOC,GPIO_PIN_14,GPIO_PIN_SET );
		HAL_GPIO_WritePin(GPIOC,GPIO_PIN_15,GPIO_PIN_SET );
	
	HAL_GPIO_WritePin(GPIOC,dsLED<<8,GPIO_PIN_RESET );
//	
//	
//	  led(2,0);
//		led(3,0);
//		led(4,0);
//		led(5,0);	
//	  led(6,0);
//		led(7,0);
//		led(8,0);
//	
	
//	HAL_GPIO_WritePin(GPIOD,GPIO_PIN_2,GPIO_PIN_RESET );
//	HAL_GPIO_WritePin(GPIOD,GPIO_PIN_2,GPIO_PIN_SET );

}
```
{% endfolding %}


{% endfolding %}

{% folding open, lcd %}
比赛资源包里自带
{% endfolding %}

{% folding open, interrupt %}
{% folding open, interrupt.h %}
```
#ifndef _INTERRUPT_H_
#define _INTERRUPT_H_

#include "main.h"
#include "stdbool.h"
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim);

struct keys
{
	unsigned char judge_sta;
	bool key_sta;
	bool  single_flag;

};

#endif
```

{% endfolding %}
{% folding open, interrupt.c %}
```
#include "interrupt.h"

struct keys key[4] = {{0, false,0}, {0, false, 0},{0, false, 0}, {0, false, 0}};
//case0判断按钮有没有按下，case1消抖功能，case2判断按钮已经松开
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
	if(htim->Instance==TIM4)
	{
		key[0].key_sta=HAL_GPIO_ReadPin (GPIOB,GPIO_PIN_0 );
		key[1].key_sta=HAL_GPIO_ReadPin (GPIOB,GPIO_PIN_1 );
		key[2].key_sta=HAL_GPIO_ReadPin (GPIOB,GPIO_PIN_2 );
		key[3].key_sta=HAL_GPIO_ReadPin (GPIOB,GPIO_PIN_3 );
		
		for(int i=0;i<4;i++)
		{
			switch (key[i].judge_sta)
			{
				case 0:
				{
					if(key[i].key_sta==0)	{
						key[i].judge_sta=1;
							
					}
				}break;
				case 1:
				{
					if(key[i].key_sta==0)	
					{
					
						key[i].judge_sta=2;
						key[i].single_flag=1;
						
					}else key[i].judge_sta=0;
				}break;
				case 2:
				{
					if(key[i].key_sta==1){
						
					
						key[i].judge_sta=0;
					}
					
				}break;
			}
		}
		
	}
}

```

{% endfolding %}

{% endfolding %}

{% folding open, ADC %}

{% folding open, aadc.h %}
```
#include "main.h"
double getADC(ADC_HandleTypeDef *pin);

```
{% endfolding %}

{% folding open, aadc.c %}
```
#include "aadc.h"

double getADC(ADC_HandleTypeDef *pin)
{
	unsigned int adc;
	HAL_ADC_Start(pin);
	adc=HAL_ADC_GetValue(pin);
	return adc*3.3/4096;
	
}
```
{% endfolding %}

{% endfolding %}


{% endfolding %}