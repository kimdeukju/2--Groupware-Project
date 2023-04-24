# 2차 Groupware Project
 
##  개요
- SpringFramework, Chat-bot을 이용한 그룹웨어 프로젝트


##  프로젝트 기간
   2023. 03-17 ~ 2023. 04-06

##  참여 인원
- 팀장 : 강창신 - 결재문서 CRUD , 근태 기능 , naver-API
- 팀원1 : 이지창 - 회원CRUD , 부서CRUD , FullCalendar-API , AWS EC2 배포
- 팀원2 : 김득주 - 로그인&Spring Security , Open API(Weather,Bus) , Oauth2
- 팀원3 : 장효선 - 게시판CRUD , 댓글CRUD , 전체적인 디자인 수정
- 팀원4 : 허인경 - 사건CRU , KakaoMap-API , left-Menubar 제작

## 개발환경
![image](https://user-images.githubusercontent.com/106312692/233287521-0a67e2a4-5419-463b-b516-f081c55e1711.png)

## 프로젝트 소개
![image](https://user-images.githubusercontent.com/106312692/233547998-11e082cc-f46f-4857-9402-db190f93ae02.png)

## 선정이유

### 관리자 페이지의 특성

- 관리자 페이지는 원활한 업무 처리를 위한 페이지
- 일반적인 게시판과 달리, 더욱 많은 기능을 제어하고 사용할 수 있는 권한을 부여할 수 있다.

### 경찰을 대상으로 하는 관리자 페이지
- 경찰의 업무는 사건 사고를 중심으로 업무가 진행됨

<hr>

## Code

<details>
<summary>Security</summary>
 
 ### WebSecurity
 
```
 @Bean
    public SecurityFilterChain fileChain(HttpSecurity http) throws Exception{
        http.csrf().disable(); //페이지보안설정 Exception 예외처리
        http.userDetailsService(userDetailSecurity);
        http.sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED);
        //권한
        http.authorizeHttpRequests()
                .antMatchers("/login").permitAll()
                .antMatchers("/police/**","/event/**","/index").authenticated()
                .antMatchers("/index","/police/**","/event/**").hasAnyRole("ADMIN","MEMBER")
                .antMatchers("/admin/**").hasRole("ADMIN");
        http.formLogin()
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .defaultSuccessUrl("/index")
                .failureHandler(customFailHandler)
                .and()
                .oauth2Login()
                .loginPage("/login")
                .and()
                .logout()
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/");
        return http.build();
    }
}
```
 
### UserDetailSecurity
 
```
@Override           //loadUserByUsername메서드는 "이런 정보가 들어왔는데 얘 혹시 회원이야?" 라고 묻는 메서드이다.
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<PoliceEntity> police = policeRepository.findByEmail(email);

        if (!police.isPresent()){
            throw new UsernameNotFoundException("사용자가 없습니다.");
    }
        PoliceEntity policeEntity=police.get();
        return User.builder()    //스프링관리자 User 역할을 빌더로 간단하게만듬
                .username(policeEntity.getEmail())
                .password(policeEntity.getPassword())
                .roles(policeEntity.getRole().toString())
                .build();
}
    @Bean  // 비밀번호 암호화
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
```
</details>
 
  <details><summary>Login</summary><blockquote>
  
   
   
   
  <details><summary>Login Main</summary><blockquote>
  
 <details><summary>Controller</summary><blockquote>
  
 ```
@GetMapping({"/",""})
    public String basic(){
        return "login/login";
    }
 ```
  </blockquote></details>

<details><summary>Login Fail</summary><blockquote>
  
<details><summary>CustomAuthFailureHandler</summary><blockquote>
  
```
      @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        String errorMessage;
        if (exception instanceof BadCredentialsException){
            errorMessage ="아이디 또는 비밀번호가 맞지 않습니다. 다시 확인해주세요.";
        }else if (exception instanceof InternalAuthenticationServiceException) {
            errorMessage = "내부적으로 발생한 시스템 문제로 인해 요청을 처리할 수없습니다 관리자에게 문의해주세요.";
        }else if (exception instanceof UsernameNotFoundException) {
            errorMessage = "계정이 존재하지 않습니다. 회원가입 진행 후 로그인 해주세요.";
        }else if (exception instanceof AuthenticationCredentialsNotFoundException) {
            errorMessage = "인증 요청이 거부되었습니다. 관리자에게 문의하세요.";
        }else{
            errorMessage="알 수 없는 이유로 로그인에 실패하였습니다 관리자에게 문의하세요";
        }
        errorMessage = URLEncoder.encode(errorMessage, "UTF-8");
        setDefaultFailureUrl("/login?error=true&exception="+errorMessage);
        super.onAuthenticationFailure(request, response, exception);
    }
}
```
</blockquote></details>
     
<details><summary>Controller</summary><blockquote>
  
```
@GetMapping("/login")         //로그인 오류
    public String login(@RequestParam(value = "error" ,required = false ) String error,
                        @RequestParam(value = "exception" ,required = false)String exception,
                        Model model) {
        model.addAttribute("error",error);
        model.addAttribute("exception",exception);
        return "login/login";
    }
```
</blockquote></details>
</blockquote></details>

<details><summary>View</summary><blockquote>

<details><summary>Html</summary><blockquote>

 ```
 <body>
  <div class="login-container">
    <div class="login">
      <div class="header-home">
           <a href="#"><img th:src="@{/img/logo.png}" alt=""></a>
      </div>
      <div class="login-content">
        <form th:action="@{/login}" method="post" id="loginForm">
          <ul>
            <li><input type="text" name="email" id="email" placeholder="아이디"></li>
            <li><input type="password" name="password" id="password" placeholder="비밀번호"></li>
          </ul>
          <span th:if="error"><p id="valid" style="color:#ffffff; font-size:12px;" th:text="${exception}"></p></span>
          <div class="button">
            <button class="btn" type="submit">
              <span>로그인</span>
            </button>
          </div>
        </form>
      </div>
      <ul class="login-list">
          <li><a target="_blank" href="/idSearch">아이디찾기</a></li>
          <li><p class="before"></p><a target="_blank" href="/pwSearch">비밀번호찾기</a></li>
      </ul>
      <div class="oauth">
        <a th:href="@{/oauth2/authorization/google}"><img th:src="@{/img/google.png}"></a>
        <a th:href="@{/oauth2/authorization/naver}"><img th:src="@{/img/naver1.png}"></a>
        <a th:href="@{/oauth2/authorization/kakao}"><img th:src="@{/img/kakao.jpg}"></a>
      </div>
    </div>
  </div>
</body>
 ```
</blockquote></details>
 
 ![image](https://user-images.githubusercontent.com/106312692/233552605-7dbb340c-cbb9-47c5-9752-a18628743e9c.png)
</blockquote></details>
</blockquote></details>
   
<details><summary>Oauth2</summary><blockquote>

 <details><summary>Yml</summary><blockquote>

```
spring:
  security:
    oauth2.client:
      registration:
        google:
          clientId:  #본인꺼등록
          clientSecret:    #본인꺼등록
          scope: email,profile

          # 네이버는 Spring Security를 공식 지원하지 않기 때문에 Provider 값들을 수동으로 입력한다.
        naver:
          client-id:  #본인꺼등록
          client-secret:   #본인꺼등록
          redirect-uri: "http://localhost:8099/login/oauth2/code/naver"
          authorization-grant-type: authorization_code
          scope:
            - email
            - nickname
          client-name: Naver
        kakao:
          client-id:  #본인꺼등록
          redirect-uri: "http://localhost:8099/login/oauth2/code/kakao"
          client-authentication-method: POST
          authorization-grant-type: authorization_code
          scope: profile_nickname, account_email #동의 항목
          client-name: Kakao

  #이렇게 꼭 써야한다
      provider:
        naver:
          authorization-uri: https://nid.naver.com/oauth2.0/authorize
          token-uri: https://nid.naver.com/oauth2.0/token
          user-info-uri: https://openapi.naver.com/v1/nid/me
          user-name-attribute: response
  
        kakao:
          authorization-uri: https://kauth.kakao.com/oauth/authorize
          token-uri: https://kauth.kakao.com/oauth/token
          user-info-uri: https://kapi.kakao.com/v2/user/me
          user-name-attribute: id
```
</blockquote></details>
 
 <details><summary>View</summary><blockquote>
  
![image](https://user-images.githubusercontent.com/106312692/233553818-c7ed352c-f34b-4e8b-9fc9-8b1e93706822.png)

</blockquote></details>
</blockquote></details>
   
<details><summary>Email찾기 & Password찾기(SMTP 이용하여 Mail로 임시비밀번호받기)</summary><blockquote>

<details><summary>Email 찾기</summary><blockquote>

 <details><summary>Controller</summary><blockquote>

```
@GetMapping("/idSearch")
    public String idsearch(){
        return "login/idSearch";
    }
    @PostMapping("/idSearch")
    public String policenumber(@RequestParam int policeNumber,
                               Model model){
        PoliceDto policeDto=policeLoginService.policeid(policeNumber);
        model.addAttribute("teamDto",policeDto);
        if(policeDto==null){
            return "login/error";
        }else {
            System.out.println("조회성공");
            return "login/idSearch1";
        }
    }
```
</blockquote></details>

<details><summary>Service</summary><blockquote>

```
public PoliceDto policeid(int policeNumber) {
        Optional<PoliceEntity> policeEntity = policeRepository.findByPoliceNumber(policeNumber);
        if (!policeEntity.isPresent()) {
            return null;
        }
        PoliceDto teamDto = PoliceDto.teamDtoid(policeEntity.get());
        return teamDto;
    }
```
</blockquote></details>
 
 <details><summary>View</summary><blockquote>
  
  <details><summary>Html</summary><blockquote>

### 사원번호 입력 후 DB에 존재하면 불러오기 html
```
<body>
  <div class="login-container">
    <div class="login">
      <div class="header-home">
         <a href="#"><img th:src="@{/img/logo.png}" alt=""></h1></a>
      </div>
      <div class="login-content">
        <form th:action="@{/idSearch}" method="post" id="idSearch">
          <ul><li><input type="number" name="policeNumber" id="policeNumber" placeholder="사원번호입력"></li></ul>
          <div class="button">
            <button class="btn" type="submit"><span>찾기</span></button>
          </div>
        </form>
      </div>
      <ul class="login-list">
        <li><p class="before"></p><a target="_blank" href="/pwSearch">비밀번호찾기</a></li>
      </ul>
    </div>
  </div>
</body>
```
   
### 사원번호로 호출한 아이디 View Html
   
```
<body>
  <div class="login-container">
    <div class="login">
      <div class="header-home">
         <a href="#"><img th:src="@{/img/logo.png}" alt=""></h1></a>
      </div>
      <div class="login-content">
        <ul><li><input type="text" name="email" id="email" th:value="${teamDto.email}" readonly></li></ul>
        <ul><li><input type="number" name="policeNumber" id="policeNumber"  th:value="${teamDto.policeNumber}" readonly></li></ul>
      </div>
      <ul class="login-list"><li><p class="before"></p><a target="_blank" href="/pwSearch">비밀번호찾기</a></li></ul>
    </div>
  </div>
</body>
```
</blockquote></details>
 
 ### 사원번호 입력 후 DB에 존재하면 불러오기 
![image](https://user-images.githubusercontent.com/106312692/233556321-681dc642-397c-4438-8411-1344fe9dcb23.png)

 ### 불러오기완료
 ![image](https://user-images.githubusercontent.com/106312692/233556641-e26aad54-8bc1-4ae6-8ef2-1338c8a0f6f7.png)

</blockquote></details>
</blockquote></details>

 <details><summary>비밀번호찾기(SMTP이용하여 Mail로 임시 비밀번호 받기)</summary><blockquote>

  <details><summary>Controller</summary><blockquote>

   ### Password Search
```
   @GetMapping("/pwSearch")
    public String pwsearchapi(){
        return "login/smtppwSearch";
    }
```
   
### SMTP
   
```
  @PostMapping("/smtppwSearch")
    public ResponseDto<?> find(@RequestBody PoliceDto dto) {
        if(!policeRepository.existsByPoliceNumber(dto.getPoliceNumber()) || !Pattern.matches("^[a-zA-Z0-9+-\\_.]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$", dto.getEmail())) {
            Map<String, String> validResult = new HashMap<>();
            if(!policeRepository.existsByPoliceNumber(dto.getPoliceNumber())) {
                validResult.put("policeNumber", "존재하지 않는 사원번호입니다.");
            }
            if(!Pattern.matches("^[a-zA-Z0-9+-\\_.]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$", dto.getEmail())) {
                validResult.put("email", "올바르지 않은 이메일 형식입니다.");
            }
            return new ResponseDto<>(HttpStatus.BAD_REQUEST.value(), validResult);
        }
        PoliceLoginService.sendTmpPwd(dto);
        return new ResponseDto<Integer>(HttpStatus.OK.value(), 1);
    }
}
```
</blockquote></details>

<details><summary>Service</summary><blockquote>

```
//SMTP 메일로 임시비밀번호 받기
    @Value("${spring.mail.username}")
    private String sendFrom;
    private final JavaMailSender javaMailSender;
    private final BCryptPasswordEncoder encoder;
    @Transactional
    public void sendTmpPwd(PoliceDto dto) {    //임시비밀번호
        char[] charSet = new char[] { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
                'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' };
        String tmpPwd = "";
        // 문자 배열 길이의 값을 랜덤으로 10개를 뽑아 구문을 작성함
        int idx = 0;
        for (int i = 0; i < 10; i++) {
            idx = (int) (charSet.length * Math.random());
            tmpPwd += charSet[idx];
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(dto.getEmail());
            message.setFrom(sendFrom);
            message.setSubject("1석2조 임시 비밀번호 안내 이메일입니다.");
            message.setText("안녕하세요.\n"
                    + "1석2조 임시비밀번호 안내 관련 이메일 입니다.\n"
                    + "임시 비밀번호를 발급하오니 사이트에 접속하셔서 로그인 하신 후\n"
                    + "반드시 비밀번호를 변경해주시기 바랍니다.\n\n"
                    + "임시 비밀번호 : " + tmpPwd);
            javaMailSender.send(message);
        } catch (MailParseException e) {
            e.printStackTrace();
        } catch (MailAuthenticationException e) {
            e.printStackTrace();
        } catch (MailSendException e) {
            e.printStackTrace();
        } catch (MailException e) {
            e.printStackTrace();
        }
        PoliceEntity user = policeRepository.findByPoliceNumber(dto.getPoliceNumber()).orElseThrow(() -> {
            return new IllegalArgumentException("임시 비밀번호 변경 실패: 사용자 사원번호를 찾을 수 없습니다.");
        });
        user.setPassword(encoder.encode(tmpPwd));
    }

```
</blockquote></details>
  
<details><summary>View</summary><blockquote>

<details><summary>Html</summary><blockquote>

```
<body>
  <div class="login-container">
    <div class="login">
      <div class="header-home">
         <a href="#"><img th:src="@{/img/logo.png}" alt=""></h1></a>
      </div>
      <div class="login-content">
          <ul>
            <li><label for="email"></label><input type="text" id="email" name="email" placeholder="이메일입력"></li>
          </ul>
          <ul>
            <li><label for="policeNumber"></label><input type="number" id="policeNumber" name="policeNumber" placeholder="사원번호입력"></li>
          </ul>
          <div class="button">
            <button class="btn" type="button" id="btn-find"><span>찾기</span></button>
          </div>
      </div>
      <ul class="login-list"><li><a target="_blank" href="/idSearch">아이디찾기</a></li></ul>
    </div>
  </div>
</body>
```
</blockquote></details>

<details><summary>Js(ajax)</summary><blockquote>

```
let index_user = {
	init: function() {
		$("#btn-find").on("click", () => {
			this.find();
		});
	},
	find: function() {
		LoadingWithMask();
		let data = {
		
			policeNumber: $("#policeNumber").val(),
			email: $("#email").val()	
		};
		
		$.ajax({
			type: "POST",
			url: "/smtppwSearch",
			data: JSON.stringify(data),
			contentType: "application/json; charset=utf-8"
		}).done(function(resp) {
			if (resp.status == 400) {
				if (resp.data.hasOwnProperty('email')) {
					$('#email').text(resp.data.valid_email);
					$('#email').focus();
				} else {
					$('#email').text('');
				}
				
				if (resp.data.hasOwnProperty('policeNumber')) {
					$('#policeNumber').text(resp.data.valid_username);
					$('#policeNumber').focus();
				} else {
					$('#policeNumber').text('');
				}
				
				closeLoadingWithMask();
			} else {				
				alert("임시 비밀번호가 발송되었습니다.");
				location.href = "/login";
			}
		}).fail(function(error) {
			console.log(error);
		});
	}
}
index_user.init();

function LoadingWithMask() {
    //화면의 높이와 너비를 구합니다.
    var maskHeight = $(document).height();
    var maskWidth  = window.document.body.clientWidth;

    //화면에 출력할 마스크를 설정해줍니다.
    var mask    = "<div id='mask' style='position:absolute; z-index:9000; background-color:#000000; display:none; left:0; top:0;'></div>";
    var spinner = "<div id='spinner' style='position: absolute; top: 45%; left: 50%; margin: -16px 0 0 -16px; display: none; color: #4dff93;' class='spinner-border'></div>";

    //화면에 레이어 추가
    $('body')
        .append(mask)

    //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채웁니다.
    $('#mask').css({
            'width' : maskWidth,
            'height': maskHeight,
            'opacity' : '0.3'
    });

    //마스크 표시
    $('#mask').show();

    //로딩중 이미지 표시
    $('body').append(spinner);
    $('#spinner').show();
}
function closeLoadingWithMask() {
	$('#mask, #spinner').hide();
	$('#mask, #spinner').empty();
}
```
</blockquote></details>

### Email과 사원번호 입력
![image](https://user-images.githubusercontent.com/106312692/233560742-a04cd763-1613-41dd-8e20-c0f695e4d416.png)

### 전송성공
![image](https://user-images.githubusercontent.com/106312692/233561027-7b2660b3-a2f3-4a62-a2e7-d29a661a41c0.png)

### 임시 비밀번호 발급 완료
![image](https://user-images.githubusercontent.com/106312692/233561390-71fddaee-0eb1-49e2-ab5b-2d02c365e515.png)

</blockquote></details>

</blockquote></details>
 
</blockquote></details>
   
</blockquote></details>

<details><summary>Open API</summary><blockquote>

<details><summary>Weather</summary><blockquote>

<details><summary>Controller</summary><blockquote>

```
@GetMapping("/weather")
    public String weather(){
        return "openApi/api/weather/index";
    }
```

</blockquote></details>

<details><summary>View</summary><blockquote>

<details><summary>Html</summary><blockquote>

```
<div class="weather-con">
  <div class="city-search">
    <select name="search" id="search">
      <option value="Seoul">서울</option>
      <option value="Busan">부산</option>
      <option value="ChunCheon">춘천</option>
    </select>
    <input type="button" onclick="weatherSearch()" value="검색">
  </div>
  <div class="weather-list">
    <div
      style="background-color : rgb(101, 178, 255); box-sizing: border-box; padding : 10px;color : #fff; width:300px; height : 150px">
      <div style="float : left;">
        <div class="weather_icon con"></div>
      </div><br>
      <div style="float : right; margin : -5px 0px 0px 60px; font-size : 11pt">
        <div class="temp_min con"></div>
        <div class="temp_max con"></div>
        <div class="humidity con"></div>
        <div class="wind con"></div>
        <div class="cloud con"></div>
      </div>
      <div style="float : right; margin-top : -45px;">
        <div class="current_temp con" style="font-size : 50pt"></div>
        <div class="weather_description con" style="font-size : 20pt"></div>
        <div class="city con" style="font-size : 13pt"></div>
      </div>
    </div>
  </div>
</div>
```

</blockquote></details>

<details><summary>Js(ajax)</summary><blockquote>

```
const search = document.querySelector('#search');
const weatherList = document.querySelector('.weather-list');
const weatherListCon = document.querySelectorAll('.weather-list .con');

function weatherSearch(){
   weatherFn(search.value);
}


function weatherFn(cityVal){
  
  weatherListCon.forEach(el => {
    el.innerText = "";
  });

  // 날씨 api - fontawesome 아이콘
  let weatherIcon = {
    '01': 'fas fa-sun',
    '02': 'fas fa-cloud-sun',
    '03': 'fas fa-cloud',
    '04': 'fas fa-cloud-meatball',
    '09': 'fas fa-cloud-sun-rain',
    '10': 'fas fa-cloud-showers-heavy',
    '11': 'fas fa-poo-storm',
    '13': 'far fa-snowflake',
    '50': 'fas fa-smog'
  };




  let appUrl=`https://api.openweathermap.org/data/2.5/weather?q=${cityVal}&appid=d120b9753476cf52cef225aa91adca64`;
  // let appUrl="https://api.openweathermap.org/data/2.5/weather?q="+cityVal+"&appid=d120b9753476cf52cef225aa91adca64";
  $.ajax({
    url: appUrl,
    dataType: "json",
    type: "GET",
    success:function(result){
      console.log(result+" <-rs"+(typeof result));
      let lon=result.coord.lon; // 경도
      let lat=result.coord.lat; //위도

    
      console.log(lon, lat);

      
      let $Icon = (result.weather[0].icon).substr(0, 2);
      let $weather_description = result.weather[0].main;    //현재 날씨 상태(맑다)
      console.log(result.weather[0].description+"<<현재날시 세세한 ")
      let $Temp = Math.floor(result.main.temp - 273.15) + 'º';
                                      //절대영도 -273.15 -> 섭씨 0
      let $humidity = '습도&nbsp;&nbsp;&nbsp;&nbsp;' + result.main.humidity + ' %';
      let $wind = '바람&nbsp;&nbsp;&nbsp;&nbsp;' + result.wind.speed + ' m/s';
      let $city = cityVal;
      let $cloud = '구름&nbsp;&nbsp;&nbsp;&nbsp;' + result.clouds.all + "%";
      let $temp_min = '최저 온도&nbsp;&nbsp;&nbsp;&nbsp;' + Math.floor(result.main.temp_min - 273.15) + 'º';
      let $temp_max = '최고 온도&nbsp;&nbsp;&nbsp;&nbsp;' + Math.floor(result.main.temp_max - 273.15) + 'º';

      $('.weather_icon').append('<i class="' + weatherIcon[$Icon] +
        ' fa-5x" style="height : 150px; width : 150px;"></i>');
      $('.weather_description').prepend($weather_description);
      $('.current_temp').prepend($Temp);
      $('.humidity').prepend($humidity);
      $('.wind').prepend($wind);
      $('.city').append($city);
      $('.cloud').append($cloud);
      $('.temp_min').append($temp_min);
      $('.temp_max').append($temp_max);


      mapFn(lon,lat);

    }
  })
}

(
  ()=>{
    weatherFn("seoul")
  }
)();

function mapFn(lon,lat){

//   console.log(lon, lat);
  //카카오 지도 api
  var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
  mapOption = { 
      center: new kakao.maps.LatLng(lat,lon), // 지도의 중심좌표
      level: 3 // 지도의 확대 레벨
  };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

// 마커가 표시될 위치입니다 
var markerPosition  = new kakao.maps.LatLng(lat,lon); 

// 마커를 생성합니다
var marker = new kakao.maps.Marker({
  position: markerPosition
});

// 마커가 지도 위에 표시되도록 설정합니다
marker.setMap(map);

// 아래 코드는 지도 위의 마커를 제거하는 코드입니다
// marker.setMap(null);    
}
```

</blockquote></details>


![image](https://user-images.githubusercontent.com/106312692/233930849-4c388c6c-d04d-48a9-b835-03b1527ade2a.png)

</blockquote></details>

</blockquote></details>

<details><summary>Bus</summary><blockquote>

<details><summary>Controller</summary><blockquote>

```
@GetMapping("/bus")
    public String bus(){
        return "openApi/api/bus/index";
    }

@GetMapping("/busList")
    public Map<String,String> busList(@RequestParam(required = false)
                                          String strSrch) throws IOException{
        String busList=ApiExplorer.getBusList(strSrch);
        System.out.println(busList+"busList");
        Map<String,String> map=new HashMap<>();
        map.put("busList",busList);
        return map;
    }
    @GetMapping("/busId1")
    public Map<String,String> busId(@RequestParam(required = false)
                                      String busRouteId) throws IOException{
        String busId2=ApiExplorer.getbusRouteId(busRouteId);
        System.out.println(busId2+"busId2");
        Map<String,String> map=new HashMap<>();
        map.put("busId3",busId2);
        return map;
    }
}

```

</blockquote></details>

<details><summary>ApiExplorer</summary><blockquote>

```
//버스노선검색
    public static String getBusList(String strSrch) throws IOException {
        
        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList"); /*URL*/
        urlBuilder.append("?" + URLEncoder.encode("serviceKey","UTF-8")
                + "=t6bf2Uyotp9m%2BEH4ZU6c9%2FJalIOtiZNFLovcCtx1og%2FtDmdgEjcQwwGhgHQKe5mI0z4ejLqllt0mqDaAmany3w%3D%3D"); /*Service Key*/
        urlBuilder.append("&" + URLEncoder.encode("strSrch","UTF-8") + "=" + URLEncoder.encode(strSrch, "UTF-8")); /**/
        urlBuilder.append("&resultType=json");

        URL url = new URL(urlBuilder.toString());

        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");
        System.out.println("Response code: " + conn.getResponseCode());
        BufferedReader rd;
        if(conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();
        System.out.println(sb.toString());
        return sb.toString();
    }
    //버스노선검색
    public static String getbusRouteId(String busRouteId) throws IOException {

        StringBuilder urlBuilder = new StringBuilder("http://ws.bus.go.kr/api/rest/busRouteInfo/getStaionByRoute"); /*URL*/
        urlBuilder.append("?" + URLEncoder.encode("serviceKey","UTF-8")
                + "=t6bf2Uyotp9m%2BEH4ZU6c9%2FJalIOtiZNFLovcCtx1og%2FtDmdgEjcQwwGhgHQKe5mI0z4ejLqllt0mqDaAmany3w%3D%3D"); /*Service Key*/
        urlBuilder.append("&" + URLEncoder.encode("busRouteId","UTF-8") + "=" + URLEncoder.encode(busRouteId, "UTF-8")); /**/
        urlBuilder.append("&resultType=json");

        URL url = new URL(urlBuilder.toString());

        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");
        System.out.println("Response code: " + conn.getResponseCode());
        BufferedReader rd;
        if(conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();
        System.out.println(sb.toString());
        return sb.toString();
    }
}
```

</blockquote></details>

<details><summary>View</summary><blockquote>

<details><summary>Html</summary><blockquote>

```
<div class="bus">
  <div class="bus-con">
    <div class="bus-header">
      <h1>공공데이터포털 버스 API</h1>
      <input type="text" name="search" id="search" value="146">
      <input type="button" value="버스노선검색" onclick="busSearch()">
    </div>
    <div class="bus-detail">
      <table>
        <thead>
        <tr>
          <th>노선명</th>
          <th>노선유형</th>
          <th>노선거점</th>
          <th>노선종점</th>
          <th>첫차시간</th>
          <th>막차시간</th>
          <th>배차간격</th>
          <th>버스위치정보</th>
          <th>버스타입</th>
        </tr>
        </thead>
        <tbody id="bus1">


        </tbody>
      </table>
    </div>
  </div>
```

</blockquote></details>

<details><summary>Js(ajax)</summary><blockquote>

```
const busDetail=document.querySelector('.bus-detail')
let tbodyTag=document.querySelector('#bus1');

function busSearch(){
  let html1="";
  let search=document.querySelector('#search')
  let strSrch=search.value;
  console.log(strSrch +' < - strSearch2222 ')
    let apiUrl= `/api/busList?strSrch=${strSrch}`;
  console.log(apiUrl +' < - apiUrl ')
     fetch(apiUrl)
    .then(response => response.json())
     .then(function (msg) { //아래부터는 html로 가져오기 위한 코드-->
              console.log(msg)
//                let jsonRs= JSON.parse(msg.rs);
                let jsonRs= JSON.parse(msg.busList);
               jsonRs.msgBody.itemList.forEach(el=>{
                       html1 += "<tr>";
                        html1+=`
                                                <td>${el.busRouteNm}</td>
                                                 <td>${el.routeType}</td>
                                                 <td>${el.edStationNm}</td>
                                                 <td>${el.stStationNm}</td>
                                                 <td>${el.firstBusTm}</td>
                                                 <td>${el.lastBusTm}</td>
                                                 <td>${el.term}</td>
                            <td onclick='stationPost(event.target.innerText)' style="background-color:#ffff00">${el.busRouteId}</td>
                              <td>${el.routeType}</td>
                        `;
                         html1 += "</tr>";
                  });
                 // console.log(html1+" << ")
                  tbodyTag.innerHTML=html1
    });
}
(
    ()=>{
    busSearch()
    }
)();
// 버스 정류장 조회
//var url = 'https://cors-anywhere.herokuapp.com/http://ws.bus.go.kr/api/rest/busRouteInfo/geStaionByRoute?serviceKey=키값&busRouteId=버스ID&resultType=json'; /*URL*/
let stationNmTag= document.querySelector('.stationNm');
function stationPost(busId){
  let html1="";
  let type='busRouteInfo/getStaionByRoute?';
//  let busRouteId=busId;     //<<위에 펑션 변수이름쓴거다
//  let apiUrl=`${url}busRouteInfo/getStaionByRoute?serviceKey=${serviceKey}&busRouteId=${busRouteId}&resultType=json`;
//let apiUrl= `/api/busId?busRouteId=${busRouteId}`;
let apiUrl= `/api/busId1?busRouteId=${busId}`;   //${ ? }펑션변수이름
 fetch(apiUrl)
    .then(response => response.json())
     .then(function (msg) { //아래부터는 html로 가져오기 위한 코드-->
              console.log(msg+"  <<<")
        let jsonRs= JSON.parse(msg.busId3);
               jsonRs.msgBody.itemList.forEach(el=>{
                    //   console.log(el);
                    console.log(el.gpsX, el.gpsY,el.stationNm); // kakao map 표시
                    html1+=`<div>${el.stationNm}</div>`;
               })
               stationNmTag.innerHTML=html1;
                positionFn(jsonRs.msgBody.itemList);
    });
}
function positionFn(dataVal) {
     let positions = [];
     let lat = 0;
     let lng = 0;
     dataVal.forEach((el, idx) => {
       lat = el.gpsY;
       lng = el.gpsX;
       let result = {
         title: el.stationNm,
         latlng: new kakao.maps.LatLng(parseFloat(lat), parseFloat(lng))
       };
       positions.push(result);
     });
     let mapContainer = document.getElementById('map'), // 지도를 표시할 div
       mapOption = {
         center: new kakao.maps.LatLng(dataVal[0].gpsY, dataVal[0].gpsX), // 지도의 중심좌표
         level: 5 // 지도의 확대 레벨
       };
     // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
     let map = new kakao.maps.Map(mapContainer, mapOption);
     // 주소-좌표 변환 객체를 생성합니다
     let geocoder = new kakao.maps.services.Geocoder();
     // 마커 이미지의 이미지 주소입니다
     let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
     for (let i = 0; i < dataVal.length; i++) {
       // 마커 이미지의 이미지 크기 입니다
       let imageSize = new kakao.maps.Size(24, 35);
       // 마커 이미지를 생성합니다
       let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
       // 마커를 생성합니다
       let marker = new kakao.maps.Marker({
         map: map, // 마커를 표시할 지도
         position: positions[i].latlng, // 마커를 표시할 위치
         title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
         image: markerImage // 마커 이미지
       });
     } //for
     map.setCenter(positions[0].latlng); //기점 을 중심좌표
   }
```

</blockquote></details>

![image](https://user-images.githubusercontent.com/106312692/233932447-c58e19cf-2f85-43ac-9283-a077086bc5b4.png)


</blockquote></details>

</blockquote></details>

</blockquote></details>


 <hr>
   
   ## 후기
   
   3주간 진행된 두번째 프로젝트 입니다. 막막한 부분도 있었고 힘든 부분도 많았습니다.
   
   1차 프로젝트와 같은 팀원들과 맞춰보았던 합이 있어서 원할하게 프로젝트를 수행할 수 있었던것 같습니다.
   
   1차 프로젝트에서 제 역할을 완벽하게 구현하지 못했던 점들을 보강하여 완만한 결과물을 만들 수 있었던 것 같습니다.
   
   배울점도 많았고 , 아직 공부 해야할 부분이 많다는 점도 알게된거 같습니다.

   1차 프로젝트 2차프로젝트에서 제가 해보지 못했던 포지션들을 공부하며 저만의 것으로 만들기 위해 노력 할 것입니다.

   귀한시간 읽어주셔서 감사합니다.
