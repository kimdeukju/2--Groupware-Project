# 2차 Groupware Project
 
##  개요
- SpringFramework, Chat-bot을 이용한 그룹웨어 프로젝트


##  프로젝트 기간
   2023. 02-13 ~ 2023. 03-13

##  참여 인원
- 팀장 : 강창신 - 결재문서 CRUD , 근태 기능 , naver-API
- 팀원1 : 이지창 - 회원CRUD , 부서CRUD , FullCalendar-API , AWS EC2 배포
- 팀원2 : 김득주 - 로그인&Spring Security , Open API(Weather,Bus) 
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
