PlayGMChatDiscord.MAIN = METHOD({
	
	run : () => {
		
		const URL_REGEX = /(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-a-z\u0080-\uffff\d{1-3}]+\.)+(?:[a-z\u0080-\uffff]+))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\u0000-\uffff~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\u0000-\uffff~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\u0000-\uffff~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\u0000-\uffff~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\u0000-\uffff~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\u0000-\uffff~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;
		const MAX_FILE_SIZE = 20971520;
		
		let discordRoom = PlayGMChatDiscord.ROOM('Discord');
		
		let connectionsRef = firebase.database().ref('connections-discord');
		let iconsRef = firebase.storage().ref('icons-discord');
		let uploadsRef = firebase.storage().ref('uploads');
		
		let user;
		let userIconURL;
		let userIconURLs = {};
		
		let lastSendedMessage;
		
		let chatStore = STORE('PlayGMChat');
		let skin = chatStore.get('skin');
		if (skin === undefined) {
			skin = '디코';
		}
		
		let skinData = SKINS[skin];
		if (skinData === undefined) {
			skinData = SKINS.디코
		}
		
		let startService = () => {
			
			// 호출 허락 (아이폰은 지원안함)
			if (global.Notification !== undefined && Notification.permission !== 'granted') {
				Notification.requestPermission();
			}
			
			let menuPanel;
			
			// 메뉴 버튼
			A({
				style : {
					position : 'fixed',
					right : INFO.getOSName() !== 'Android' && INFO.getOSName() !== 'iOS' ? 18 : 0,
					top : 0,
					padding : 10,
					zIndex : 998,
					color : skinData.color
				},
				c : FontAwesome.GetIcon('bars'),
				on : {
					tap : () => {
						
						if (menuPanel !== undefined) {
							menuPanel.remove();
						}
						
						// 메뉴 열기
						menuPanel = UUI.PANEL({
							style : {
								position : 'fixed',
								right : 0,
								top : 0,
								width : 260,
								height : '100%',
								backgroundColor : '#444',
								color : '#fff',
								overflowY : 'scroll',
								zIndex : 999
							},
							contentStyle : {
								padding : 20
							},
							c : [A({
								style : {
									position : 'fixed',
									right : INFO.getOSName() !== 'Android' && INFO.getOSName() !== 'iOS' ? 18 : 0,
									top : 0,
									padding : 10
								},
								c : FontAwesome.GetIcon('times'),
								on : {
									tap : () => {
										menuPanel.remove();
										menuPanel = undefined;
									}
								}
							}),
							
							H3({
								style : {
									fontSize : 30,
									fontWeight : 'bold'
								},
								c : 'MENU'
							}),
							
							A({
								style : {
									marginTop : 10,
									display : 'block',
									padding : 10,
									border : '1px solid #fff',
									borderRadius : 5
								},
								c : UUI.BUTTON_H({
									style : {
										margin : 'auto'
									},
									icon : FontAwesome.GetIcon({
										style : {
											marginTop : 2
										},
										key : 'info-circle'
									}),
									spacing : 10,
									title : '명령어'
								}),
								on : {
									mouseover : (e, button) => {
										button.addStyle({
											backgroundColor : '#fff',
											color : '#000'
										});
									},
									mouseout : (e, button) => {
										button.addStyle({
											backgroundColor : 'transparent',
											color : '#fff'
										});
									},
									tap : () => {
										addHelpMessage();
									}
								}
							}),
							
							A({
								style : {
									marginTop : 10,
									display : 'block',
									padding : 10,
									border : '1px solid #fff',
									borderRadius : 5
								},
								target : '_blank',
								href : 'http://code.playgm.co.kr',
								c : UUI.BUTTON_H({
									style : {
										margin : 'auto'
									},
									icon : FontAwesome.GetIcon({
										style : {
											marginTop : 2
										},
										key : 'code'
									}),
									spacing : 10,
									title : '코드 프금'
								}),
								on : {
									mouseover : (e, button) => {
										button.addStyle({
											backgroundColor : '#fff',
											color : '#000'
										});
									},
									mouseout : (e, button) => {
										button.addStyle({
											backgroundColor : 'transparent',
											color : '#fff'
										});
									}
								}
							}),
							
							A({
								style : {
									marginTop : 10,
									display : 'block',
									padding : 10,
									border : '1px solid #fff',
									borderRadius : 5
								},
								target : '_blank',
								href : 'https://cafe.naver.com/playgm',
								c : UUI.BUTTON_H({
									style : {
										margin : 'auto'
									},
									icon : FontAwesome.GetIcon({
										style : {
											marginTop : 2
										},
										key : 'coffee'
									}),
									spacing : 10,
									title : 'PlayGM 카페'
								}),
								on : {
									mouseover : (e, button) => {
										button.addStyle({
											backgroundColor : '#fff',
											color : '#000'
										});
									},
									mouseout : (e, button) => {
										button.addStyle({
											backgroundColor : 'transparent',
											color : '#fff'
										});
									}
								}
							}),
							
							A({
								style : {
									marginTop : 10,
									display : 'block',
									padding : 10,
									border : '1px solid #fff',
									borderRadius : 5
								},
								target : '_blank',
								href : 'https://github.com/Hanul/playgm-chat-firebase',
								c : UUI.BUTTON_H({
									style : {
										margin : 'auto'
									},
									icon : FontAwesome.GetBrandIcon({
										style : {
											marginTop : 1,
											width : 14
										},
										key : 'github'
									}),
									spacing : 10,
									title : '소스코드'
								}),
								on : {
									mouseover : (e, button) => {
										button.addStyle({
											backgroundColor : '#fff',
											color : '#000'
										});
									},
									mouseout : (e, button) => {
										button.addStyle({
											backgroundColor : 'transparent',
											color : '#fff'
										});
									}
								}
							}),
							
							A({
								style : {
									marginTop : 10,
									display : 'block',
									padding : 10,
									border : '1px solid #fff',
									borderRadius : 5
								},
								target : '_blank',
								href : 'https://discordapp.com/channels/483554399243730959',
								c : UUI.BUTTON_H({
									style : {
										margin : 'auto'
									},
									icon : FontAwesome.GetBrandIcon({
										style : {
											marginTop : 1,
											width : 14
										},
										key : 'discord'
									}),
									spacing : 10,
									title : 'PlayGM 디스코드'
								}),
								on : {
									mouseover : (e, button) => {
										button.addStyle({
											backgroundColor : '#fff',
											color : '#000'
										});
									},
									mouseout : (e, button) => {
										button.addStyle({
											backgroundColor : 'transparent',
											color : '#fff'
										});
									}
								}
							})]
						}).appendTo(BODY);
					}
				}
			}).appendTo(BODY);
			
			let chatDataSet = [];
			let iconMap = {};
			let preview;
			
			let loading = IMG({
				style : {
					position : 'fixed',
					left : 5,
					bottom : 40
				},
				src : PlayGMChatDiscord.R('loading.svg')
			}).appendTo(BODY);
			
			BODY.addStyle({
				overflowY : 'hidden'
			});
			
			// 채팅 목록
			let messageList = DIV({
				style : {
					backgroundColor : skinData.backgroundColor,
					color : skinData.color,
					paddingTop : 10,
					overflowY : 'scroll',
					onDisplayResize : (width, height) => {
						// 모바일
						if (width < 800) {
							return {
								fontSize : 14,
								height : height - 50
							};
						} else {
							return {
								fontSize : 'inherit',
								height : height - 50
							};
						}
					}
				},
				on : {
					tap : () => {
						if (menuPanel !== undefined) {
							menuPanel.remove();
							menuPanel = undefined;
						}
					}
				}
			}).appendTo(BODY);
			
			let padding = DIV({
				style : {
					backgroundColor : skinData.backgroundColor,
					height : 10
				}
			}).appendTo(BODY);
			
			let scrollToEnd = () => {
				messageList.scrollTo({
					top : 999999
				});
			};
			
			// 시스템 메시지 추가
			let addSystemMessage = (message, scroll) => {
				
				messageList.append(DIV({
					style : {
						color : skinData.systemColor,
						fontWeight : 'bold',
						onDisplayResize : (width, height) => {
							// 모바일
							if (width < 800) {
								return {
									padding : '0 6px',
									paddingBottom : 6
								};
							} else {
								return {
									padding : '0 8px',
									paddingBottom : 8
								};
							}
						}
					},
					c : message
				}));
				
				if (scroll !== false) {
					scrollToEnd();
				}
			};
			
			// 도움말 추가
			let addHelpMessage = () => {
				addSystemMessage('명령어 : /명령어, /닉네임, /접속자, /스킨, /이모지, /프금, /로그아웃');
			};
			
			let showRecentlyUsers = (isFirst) => {
					
				// 최근 유저를 가져옵니다.
				connectionsRef.once('value', (snapshot) => {
					
					let connections = [];
					snapshot.forEach((childSnapshot) => {
						connections.push(childSnapshot.val());
					});
					
					let lastTime = 0;
					connections.forEach((connection) => {
						if (connection.time > lastTime) {
							lastTime = connection.time;
						}
					});
					
					let names = '';
					let recentConnections = [];	
					connections.forEach((connection) => {
						// 마지막 접속자와 비교하여 2분 미만 내에 커넥션을 유지한 사용자만
						if (lastTime - connection.time < 2 * 60 * 1000) {
							recentConnections.push(connection);
							
							if (names !== '') {
								names += ', ';
							}
							names += connection.name;
						}
					});
					
					discordRoom.send('getMembers', (memberStr) => {
						addSystemMessage('오리진 유저(' + recentConnections.length + '명) : ' + names + ' / 디스코드 유저(' + memberStr.split(',').length + '명) : ' + memberStr);
					});
				});
			};
			
			let uploadFile = (file) => {
				
				let uploadTask = uploadsRef.child(file.name).put(file);
				
				uploadTask.on('state_changed', (snapshot) => {
					uploadButton.empty();
					uploadButton.append(INTEGER((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
				}, () => {
					uploadButton.empty();
					uploadButton.append(FontAwesome.GetIcon('upload'));
				}, () => {
					uploadButton.empty();
					uploadButton.append(FontAwesome.GetIcon('upload'));
					
					uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
						discordRoom.send({
							methodName : 'sendFile',
							data : {
								userId : user.uid,
								name : user.displayName,
								userIconURL : userIconURL,
								fileName : file.name,
								downloadURL : downloadURL
							}
						});
					});
				});
			};
			
			let addMessage = (chatData) => {
				
				loading.remove();
				
				let isToScrollBottom = messageList.getScrollTop() >= messageList.getScrollHeight() - messageList.getHeight() - 10;
				
				if (chatData.userId === '485064204144082948') {
					if (chatData.message.indexOf(':') === -1) {
						chatData.name = undefined;
					} else {
						chatData.name = chatData.message.substring(0, chatData.message.indexOf(':') - 1);
						chatData.message = chatData.message.substring(chatData.message.indexOf(':') + 2);
					}
				}
				
				// 내가 방금 보낸 메시지면 이미 출력되어 있으므로 무시
				if (chatData.name === user.displayName && chatData.message === lastSendedMessage) {
					// ignore.
					return;
				}
				
				chatDataSet.push(chatData);
				
				// 시스템 알림
				if (chatData.name === undefined) {
					addSystemMessage(chatData.message);
				}
				
				// 새 메시지
				else {
					
					let icon;
					messageList.append(DIV({
						style : {
							onDisplayResize : (width, height) => {
								// 모바일
								if (width < 800) {
									return {
										padding : '0 6px',
										paddingBottom : 6
									};
								} else {
									return {
										padding : '0 8px',
										paddingBottom : 8
									};
								}
							}
						},
						c : [icon = IMG({
							style : {
								marginRight : 5,
								backgroundColor : '#fff',
								onDisplayResize : (width, height) => {
									// 모바일
									if (width < 800) {
										return {
											marginBottom : -4,
											width : 18,
											height : 18,
											borderRadius : 18
										};
									} else {
										return {
											marginBottom : -5,
											width : 20,
											height : 20,
											borderRadius : 20
										};
									}
								}
							},
							src : chatData.userId !== '485064204144082948' || userIconURLs[chatData.name] === undefined ? (
								chatData.userIconURL === undefined || chatData.userId === '485064204144082948' ? PlayGMChatDiscord.R('default-icon.png') : chatData.userIconURL
							) : userIconURLs[chatData.name]
						}), SPAN({
							style : {
								fontWeight : 'bolder',
								marginRight : 6,
								color : skinData.nameColor
							},
							c : chatData.name
						}), SPAN({
							style : {
								fontSize : 0
							},
							c : ' : '
						}), chatData.downloadURL !== undefined ? A({
							style : {
								fontWeight : 'bolder',
								textDecoration : 'underline'
							},
							c : chatData.fileName !== undefined ? chatData.fileName : chatData.downloadURL,
							target : '_blank',
							href : chatData.downloadURL,
							on : {
								mouseover : (e) => {
									
									// 모바일 제외
									if (
									INFO.getOSName() !== 'Android' && INFO.getOSName() !== 'iOS' &&
									preview === undefined && (
										chatData.fileName.indexOf('.png') !== -1 ||
										chatData.fileName.indexOf('.jpg') !== -1 ||
										chatData.fileName.indexOf('.jpeg') !== -1 ||
										chatData.fileName.indexOf('.gif') !== -1
									)) {
										
										preview = UUI.V_CENTER({
											style : {
												position : 'fixed',
												left : e.getLeft() + 10,
												top : e.getTop() - 42 - 8,
												width : 90,
												height : 60,
												backgroundColor : '#fff',
												backgroundImage : chatData.downloadURL,
												backgroundSize : 'cover',
												backgroundPosition : 'center center',
												border : '1px solid #333',
												textAlign : 'center'
											},
											c : IMG({
												style : {
													marginTop : 5
												},
												src : PlayGMChatDiscord.R('loading.svg')
											})
										}).appendTo(BODY);
										
										IMG({
											src : chatData.downloadURL,
											on : {
												load : () => {
													preview.empty();
												}
											}
										});
									}
								},
								mouseout : () => {
									if (preview !== undefined) {
										preview.remove();
										preview = undefined;
									}
								}
							}
						}) : RUN(() => {
							
							let message = chatData.message;
							
							// 호출을 찾아 교체합니다.
							let replaceCall = (message) => {
								
								let match = message.match(/\<@[^\>]*\>/);
								if (match !== TO_DELETE) {
									
									let callStr = match[0];
									let call = callStr.substring(2, callStr.length - 1);
									if (call[0] === '!') {
										call = call.substring(1);
									}
									
									let index = message.indexOf(callStr);
									
									return message.substring(0, index) + '@' + chatData.mentions[call] + replaceCall(message.substring(index + callStr.length));
								}
								return message;
							};
							message = replaceCall(message);
							
							let children = [];
							
							EACH(message.split(' '), (message, i) => {
								
								if (i > 0) {
									children.push(' ');
								}
								
								// 이모지를 찾아 교체합니다.
								let replaceEmoji = (message) => {
									
									let match = message.match(/\<:[^\>]*\>/);
									if (match === TO_DELETE) {
										children.push(message);
									}
									
									else {
										
										let emojiStr = match[0];
										let emoji = emojiStr.substring(1, emojiStr.length - 1).toLowerCase();
										
										let index = message.indexOf(emojiStr);
										
										children.push(message.substring(0, index));
										
										children.push(IMG({
											style : {
												marginBottom : -4,
												height : 20
											},
											src : 'https://cdn.discordapp.com/emojis/' + emoji.substring(emoji.lastIndexOf(':') + 1) + '.png',
											on : {
												load : () => {
													// 로딩이 다 되면 스크롤 끝으로
													if (isToScrollBottom === true || chatData.userId === user.uid) {
														scrollToEnd();
													}
												}
											}
										}));
										
										message = replaceEmoji(message.substring(index + emojiStr.length));
									}
									
									return message;
								};
								
								// 링크를 찾아 교체합니다.
								let replaceLink = () => {
									
									let match = message.match(URL_REGEX);
									if (match === TO_DELETE) {
										message = replaceEmoji(message);
									}
									
									else {
										
										let url = match[0];
										if (url.indexOf(' ') !== -1) {
											url = url.substring(0, url.indexOf(' '));
										}
										
										let index = message.indexOf(url);
										
										message = replaceEmoji(message.substring(0, index));
										message = message.substring(index + url.length);
										
										if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0 && url.indexOf('ftp://') !== 0) {
											url = 'http://' + url;
										}
										
										children.push(A({
											style : {
												textDecoration : 'underline'
											},
											target : '_blank',
											href : url,
											c : url
										}));
										
										replaceLink();
									}
								};
								
								replaceLink();
							});
							
							return SPAN({
								c : children
							});
						})]
					}));
					
					if (chatData.userId === '485064204144082948') {
						
						if (iconMap[chatData.name] === undefined) {
							iconMap[chatData.name] = [];
						}
						iconMap[chatData.name].push(icon);
						
						iconsRef.child(chatData.name).getDownloadURL().then((url) => {
							userIconURLs[chatData.name] = url;
							
							EACH(iconMap[chatData.name], (icon) => {
								icon.setSrc(url);
							});
							
						}).catch(() => {
							// ignore.
						});
					}
				}
				
				// 마지막 메시지를 보고있거나 자기가 쓴 글이라면 스크롤 맨 아래로
				if (isToScrollBottom === true || chatData.userId === user.uid) {
					scrollToEnd();
				}
			};
			
			discordRoom.send('messages', (messages) => {
				REVERSE_EACH(messages, addMessage);
				showRecentlyUsers(true);
			});
			
			discordRoom.on('message', (chatData) => {
				addMessage(chatData);
				
				// 호출 기능
				if (chatData.name !== user.displayName && (chatData.message + ' ').indexOf('@' + user.displayName + ' ') !== -1) {
					
					// 아이폰은 지원 안함
					if (global.Notification === undefined || Notification.permission !== 'granted') {
						DELAY(() => {
							discordRoom.send({
								methodName : 'send',
								data : {
									userId : user.uid,
									name : user.displayName,
									userIconURL : userIconURL,
									message : '(호출 기능이 차단된 유저입니다)'
								}
							});
						});
					}
					
					else if (document.hasFocus() !== true) {
						new Notification(chatData.name, {
							body : message,
						}).onclick = () => {
							focus();
						};
					}
				}
			});
			
			// 화면 크기가 바뀌면 스크롤 맨 아래로
			EVENT('resize', () => {
				DELAY(() => {
					scrollToEnd();
				});
			});
			
			// 메시지 입력칸
			let messageInput;
			let semiMenu;
			let fileInput;
			let uploadButton;
			FORM({
				style : {
					position : 'fixed',
					bottom : 0,
					width : '100%',
					boxShadow : '0 0 0.4em rgba(0, 0, 0, 0.15)'
				},
				c : [
				messageInput = UUI.FULL_INPUT({
					style : {
						backgroundColor : skinData.backgroundColor,
						padding : 10
					},
					inputStyle : {
						color : skinData.color
					},
					name : 'message',
					placeholder : '메시지를 입력하세요.',
					isOffAutocomplete : true,
					on : {
						tap : () => {
							if (menuPanel !== undefined) {
								menuPanel.remove();
								menuPanel = undefined;
							}
						},
						keydown : (e) => {
							if (e.getKey() === 'Escape') {
								if (semiMenu !== undefined) {
									semiMenu.remove();
								}
							}
						},
						doubletap : () => {
							
							if (semiMenu !== undefined) {
								semiMenu.remove();
							}
							
							semiMenu = DIV({
								style : {
									position : 'fixed',
									left : 5,
									bottom : 43
								},
								c : [A({
									style : {
										flt : 'left',
										padding : '4px 8px',
										border : '1px solid #999',
										backgroundColor : '#eee',
										borderRadius : 3
									},
									c : '접속자',
									on : {
										tap : () => {
											showRecentlyUsers();
										}
									}
								}), CLEAR_BOTH()]
							}).appendTo(BODY);
							
							EVENT_ONCE('tap', () => {
								if (semiMenu !== undefined) {
									semiMenu.remove();
									semiMenu = undefined;
								}
							});
						}
					}
				}),
				
				// 설정 버튼
				A({
					style : {
						position : 'fixed',
						right : 50,
						bottom : 0,
						padding : 8,
						color : '#ccc',
						fontSize : 16
					},
					c : FontAwesome.GetIcon('cog'),
					on : {
						mouseover : (e, button) => {
							button.addStyle({
								color : '#999'
							});
						},
						mouseout : (e, button) => {
							button.addStyle({
								color : '#ccc'
							});
						},
						tap : () => {
							
							// 설정 창 띄우기
							let fileInput;
							let iconPreview;
							let description;
							let settingPanel = UUI.V_CENTER({
								style : {
									position : 'fixed',
									left : 0,
									top : 0,
									width : '100%',
									height : '100%',
									backgroundColor : 'rgba(255, 255, 255, 0.75)'
								},
								c : [UUI.V_CENTER({
									style : {
										position : 'relative',
										backgroundColor : '#fff',
										width : 240,
										height : 150,
										borderRadius : 20,
										boxShadow : '0 0 2em rgba(0, 0, 0, 0.2)',
										margin : 'auto',
										textAlign : 'center'
									},
									c : [H3({
										style : {
											position : 'absolute',
											left : 20,
											top : 20,
											fontWeight : 'bolder'
										},
										c : '아이콘'
									}), fileInput = INPUT({
										style : {
											position : 'fixed',
											left : -999999,
											top : -999999
										},
										type : 'file',
										on : {
											change : () => {
												let file = fileInput.getEl().files[0];
												
												if (file.size !== undefined && file.size <= 4096) {
													
													description.empty();
													description.append('업로드 중...');
													
													iconsRef.child(user.displayName).put(file).then((snapshot) => {
														iconsRef.child(user.displayName).getDownloadURL().then((url) => {
															
															iconPreview.setSrc(url);
															
															description.empty();
															description.append('PNG, 4KB 이하');
														});
													});
												}
												
												else {
													alert('파일 용량이 초과하였습니다.');
												}
											}
										}
									}), A({
										c : iconPreview = IMG({
											style : {
												width : 20,
												height : 20,
												borderRadius : 20
											},
											src : userIconURLs[user.displayName] === undefined ? PlayGMChatDiscord.R('default-icon.png') : userIconURLs[user.displayName]
										}),
										on : {
											tap : () => {
												fileInput.select();
											}
										}
									}), description = P({
										style : {
											marginTop : 5
										},
										c : 'PNG, 4KB 이하'
									}), A({
										style : {
											position : 'absolute',
											right : 20,
											bottom : 20,
											fontWeight : 'bolder',
											textDecoration : 'underline'
										},
										c : '닫기',
										on : {
											tap : () => {
												settingPanel.remove();
											}
										}
									})]
								})]
							}).appendTo(BODY);
						}
					}
				}),
				
				fileInput = INPUT({
					style : {
						position : 'fixed',
						left : -999999,
						top : -999999
					},
					type : 'file',
					on : {
						change : () => {
							let file = fileInput.getEl().files[0];
							
							if (file.size !== undefined && file.size <= MAX_FILE_SIZE) {
								uploadFile(file);
							}
							
							else {
								alert('제한 크기를 초과한 파일입니다.');
							}
						}
					}
				}),
				
				// 업로드 버튼
				uploadButton = A({
					style : {
						position : 'fixed',
						right : 10,
						bottom : 0,
						padding : 8,
						color : '#ccc',
						fontSize : 16
					},
					c : FontAwesome.GetIcon('upload'),
					on : {
						mouseover : (e, button) => {
							button.addStyle({
								color : '#999'
							});
						},
						mouseout : (e, button) => {
							button.addStyle({
								color : '#ccc'
							});
						},
						tap : () => {
							fileInput.select();
						}
					}
				})],
				on : {
					submit : (e, form) => {
						
						let message = form.getData().message;
						form.setData({});
						
						if (message !== '') {
							
							// 명령어 처리
							if (message[0] === '/') {
								
								let args = message.substring(1).split(' ');
								let command = args[0];
								args.shift();
								
								if (command === '닉네임') {
									
									let originName = user.displayName;
									
									if (args.length === 0) {
										addSystemMessage('사용법 : /닉네임 [name]');
									}
									
									else if (originName !== args[0] && /^[ㄱ-ㅎ가-힣a-zA-Z0-9]{1,6}$/.test(args[0]) === true) {
										user.updateProfile({
											displayName : args[0]
										}).then(() => {
											discordRoom.send({
												methodName : 'send',
												data : {
													message : '[닉네임 변경] ' + originName + ' -> ' + user.displayName
												}
											});
										});
									}
								}
								
								else if (command === '접속자') {
									showRecentlyUsers();
								}
								
								else if (command === '스킨') {
									
									if (args.length === 0) {
										let skinStr = '';
										EACH(SKINS, (skinData, skin) => {
											if (skinStr !== '') {
												skinStr += ', ';
											}
											skinStr += skin;
										});
										addSystemMessage('사용법 : /스킨 [skin], 스킨 종류 : ' + skinStr);
									}
									
									else if (SKINS[args[0]] !== undefined) {
										chatStore.save({
											name : 'skin',
											value : args[0]
										});
										location.reload();
									}
								}
								
								else if (command === '이모지') {
									discordRoom.send('getEmojis', (emojiStr) => {
										
										let message = ['이모지 종류 : '];
										EACH(emojiStr.split(', '), (emoji, i) => {
											if (i > 0) {
												message.push(', ');
											}
											message.push(IMG({
												style : {
													marginBottom : -4,
													height : 20
												},
												src : 'https://cdn.discordapp.com/emojis/' + emoji.substring(emoji.lastIndexOf(':') + 1, emoji.length - 1) + '.png',
												on : {
													load : () => {
														// 로딩이 다 되면 스크롤 끝으로
														scrollToEnd();
													}
												}
											}));
											message.push(' ' + emoji);
										});
										
										addSystemMessage(message);
									});
								}
								
								else if (command === '로그아웃') {
									firebase.auth().signOut();
								}
								
								else if (command === '프금') {
									open('https://cafe.naver.com/playgm');
								}
								
								else {
									addHelpMessage();
								}
							}
							
							// 메시지 전송
							else {
								
								let chatData = {
									userId : user.uid,
									name : user.displayName,
									userIconURL : userIconURL,
									message : message.trim()
								};
								
								discordRoom.send({
									methodName : 'send',
									data : chatData
								});
								
								addMessage(chatData);
								
								lastSendedMessage = message.trim();
							}
						}
					}
				}
			}).appendTo(BODY);
			
			messageInput.focus();
			
			// 1분에 한번씩 커넥션을 유지합니다.
			INTERVAL(60, RAR(() => {
				connectionsRef.child(user.uid).set({
					name : user.displayName,
					time : firebase.database.ServerValue.TIMESTAMP
				});
			}));
			
			// 붙여넣기로 업로드
			EVENT('paste', (e) => {
				EACH(e.getClipboardItems(), (item) => {
					
					if (item.type.indexOf('image') !== -1) {
						
						let file = item.getAsFile();
						
						if (file.size !== undefined && file.size <= MAX_FILE_SIZE) {
							if (confirm('클립보드의 이미지를 업로드 하시겠습니까?') === true) {
								uploadFile(file);
							}
						}
						
						else {
							alert('제한 크기를 초과한 파일입니다.');
						}
						
						e.stopDefault();
						
						return false;
					}
				});
			});
			
			// 모바일 제외
			if (INFO.getOSName() !== 'Android' && INFO.getOSName() !== 'iOS') {
				
				// 기본 드래그 앤 드롭 막기
				EVENT('dragover', (e) => {
					e.stop();
				});
				
				// 미리보기 이동
				EVENT('mousemove', (e) => {
					if (preview !== undefined) {
						preview.addStyle({
							left : e.getLeft() + 10,
							top : e.getTop() - preview.getHeight() - 8
						});
					}
				});
				
				// 드래그 앤 드롭으로 업로드
				EVENT('drop', (e) => {
					EACH(e.getFiles(), uploadFile);
					e.stopDefault();
				});
			}
			
			iconsRef.child(user.displayName).getDownloadURL().then((url) => {
				
				userIconURL = url;
				
				userIconURLs[user.displayName] = url;
				
				EACH(iconMap[user.displayName], (icon) => {
					icon.setSrc(url);
				});
				
			}).catch(() => {
				// ignore.
			});
		};
		
		// 로그인 체크
		firebase.auth().onAuthStateChanged((_user) => {
			
			// 로그인 화면
			if (_user === TO_DELETE) {
				
				let authContainer = DIV({
					style : {
						marginTop : 20
					}
				}).appendTo(BODY);
				
				// 인증 처리
				new firebaseui.auth.AuthUI(firebase.auth()).start(authContainer.getEl(), {
					signInOptions : [
						firebase.auth.EmailAuthProvider.PROVIDER_ID
					],
					callbacks : {
						signInSuccessWithAuthResult : (authResult) => {
							authContainer.remove();
							
							if (user === undefined) {
								user = authResult.user;
								startService();
							}
							
							return false;
						}
					}
				});
			}
			
			else if (user === undefined) {
				user = _user;
				startService();
			}
		});
	}
});