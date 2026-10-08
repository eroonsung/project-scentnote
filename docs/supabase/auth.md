# 닉네임 + 숫자 4자리 로그인 (선택 사항) — Supabase 설정

앱은 Supabase 이메일 로그인을 안쪽에서 쓴다. 닉네임을 `u<16진수>@scentnote.app` 모양으로 바꿔 계정 이름으로 쓰고, 숫자 4자리에 고정 문자열을 붙여 비밀번호로 쓴다. 메일은 보내지 않는다.

대시보드에서 한 번 해 둘 설정:
1. Authentication > Sign In / Providers > **Email**: **Confirm email = OFF** (켜져 있으면 가입마다 확인 메일을 보내려고 해서 가입이 안 된다)
2. Authentication > Sign In / Providers: **Allow new users to sign up = ON**, **Anonymous sign-ins = ON**(메모·의견 저장에 이미 사용)
3. (선택) Minimum password length ≤ 6 (기본값)

테스트로 만든 `zz…` 닉네임 계정은 Authentication > Users에서 지워도 된다.
