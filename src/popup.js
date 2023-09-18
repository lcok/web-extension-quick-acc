'use strict';

import './popup.css';

(function () {


	const defaultIp = '10.0.81.124';
	const prefixIpCand = [defaultIp, '10.0.81.', '10.0.', '10.', '']

	// 输入的值
	let inputValue = "";


	const createTabBtn = document.getElementById('create-new-tab-btn');
	createTabBtn.addEventListener('click', submitNewTab);


	//  选择的服务
	let service = "/";

	const serviceCheckboxes = document.querySelectorAll('.serv');
	serviceCheckboxes.forEach(function (checkbox) {
		checkbox.addEventListener('click', updateSelectedServices);
	});

	// 更新已选服务的函数
	function updateSelectedServices() {
		const selectedServices = Array.from(serviceCheckboxes)
			.filter(checkbox => checkbox.checked)
			.map(checkbox => checkbox.value);

		if (selectedServices.length == 1) {
			service = selectedServices[0];
			console.log("已选择服务: " + service)
		} else {
			console.log('没有选中的服务,或选择了多个服务,异常!!')
		}
	}


	// 输入ip

	// 获取输入框元素
	const inputField = document.getElementById('inputField');
	// 监听输入框的键盘按下事件，并调用处理函数
	inputField.addEventListener('keydown', handleEnterKey);
	inputField.addEventListener('input', handleInput);

	function handleInput(event) {
		inputValue = inputField.value;
		updateIpStorage(inputValue);
	}

	// 定义处理回车事件的函数
	function handleEnterKey(event) {
		// 回车
		if (event.keyCode === 13) {
			submitNewTab();
		}
	}


	// 计算和打开新标签
	function submitNewTab() {
		if (inputValue.trim() === '') {
			console.log('没有输入')
			return;
		}
		const fIp = processIp(inputValue);
		const finalUrl = "http://" + fIp + service;
		openNewTabl(finalUrl);
	}


	// 补全ip
	function processIp(inputString) {
		// 去掉字符串前后的空字符
		inputString = inputString.trim();

		// 判断字符串是否只包含数字或句号
		if (/^[0-9.]+$/.test(inputString)) {
			// 去掉字符串前后的句号
			inputString = inputString.replace(/^\.+|\.+$/g, '');

			// 使用句号分割字符串为数组
			const parts = inputString.split('.');

			// 处理数组中的数字，将不在0-255范围内的数字替换为0
			// const processedParts = parts.map(part => {
			// 	const num = parseInt(part, 10);
			// 	if (!isNaN(num) && num >= 0 && num <= 255) {
			// 		return num.toString();
			// 	} else {
			// 		return '0';
			// 	}
			// });

			// 将数组中的元素使用句号重新join为一个字符串
			const resultString = prefixIpCand[parts.length] + parts.join('.');

			return resultString;
		}
		// 如果字符串不符合要求，返回空字符串
		return '';
	}

	function openNewTabl(url) {
		chrome.tabs.create({
			url
		}
		)
	}



	// --------------------------------------------------------------------------
	// 输入值的存储与恢复

	const ipStorage = {
		get: cb => {
			chrome.storage.sync.get(['inputIp'], result => {
				cb(result.inputIp);
			});
		},
		set: (value, cb) => {
			chrome.storage.sync.set(
				{
					inputIp: value,
				},
				() => {
					cb();
				}
			);
		},
	};

	function setupIpValue(initialValue = "") {
		inputValue = initialValue;
		inputField.value = initialValue;
	}


	function updateIpStorage(val) {
		ipStorage.set(val, () => { });
	}

	function restoreIpValue() {
		ipStorage.get(inputVal => {
			if (typeof inputVal === 'undefined') {
				// default ""
				ipStorage.set("", () => {
					setupIpValue("");
				});
			} else {
				setupIpValue(inputVal);
			}
		});
	}



	function hanlerDomLoaded() {
		restoreIpValue();
		inputField.focus();
	}

	document.addEventListener('DOMContentLoaded', hanlerDomLoaded);



	// 上下键,更改服务

	const radioButtons = document.querySelectorAll('input[type="radio"]');
	let selectedIndex = 0; // 记录当前选中的单选框索引

	// 添加单选框的单击事件监听器
	radioButtons.forEach(function (radioButton, index) {
		radioButton.addEventListener('click', function () {
			selectedIndex = index; // 单选框被点击时更新选中索引
		});
	});

	// 添加键盘事件监听器，监听上下箭头键
	document.addEventListener('keydown', function (event) {
		if (event.key === "ArrowUp" && selectedIndex > 0) {
			// 上箭头键，并且不是第一个单选框
			selectedIndex--;
			radioButtons[selectedIndex].click(); // 模拟单击事件
			event.preventDefault(); // 防止浏览器滚动
		} else if (event.key === "ArrowDown" && selectedIndex < radioButtons.length - 1) {
			// 下箭头键，并且不是最后一个单选框
			selectedIndex++;
			radioButtons[selectedIndex].click(); // 模拟单击事件
			event.preventDefault(); // 防止浏览器滚动
		}
	});



	// 设置插件的快捷键
	document.getElementById("shortcutBtnForExtension").addEventListener("click", function (event) {
		chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
	});

	// 跳转到源码仓库
	document.getElementById("sourceCodeBtn").addEventListener("click", function (event) {
		chrome.tabs.create({ url: 'https://github.com/lcok/web-extension-quick-acc' });
	});


})();
