# 2차 Groupware Project
 
##  개요
- SpringFramework, Chat-bot을 이용한 그룹웨어 프로젝트


##  프로젝트 기간
   2023. 02-13 ~ 2023. 03-13

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
   
   
   
   
   
   
   
   
   
   
  </blockquote></details>
