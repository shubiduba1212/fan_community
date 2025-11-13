window.addEventListener("DOMContentLoaded", () => {
  // header - activate/inactivate side nav menu when the hamburger button clicked
  const hamburgerBtn = document.querySelector(".hamburger_menu .icon_menu");
  const nav = document.querySelector(".nav");
  const cover = document.querySelector(".dark_bg");
  const body = document.querySelector("body");

  // 햄버거 메뉴 버튼 클릭시, 사이드바 메뉴 활성화
  hamburgerBtn.addEventListener("click", () => {
      if(window.innerWidth >= 1280) { // PC 모드인 경우
        nav.classList.toggle("active");
        cover.classList.toggle("active");
      }else{ // 모바일 모드인 경우
        nav.classList.add("active");
        cover.classList.add("active");
        body.classList.add("fixed");        
      }
  })

  // 활성화된 불투명배경 클릭시, 사이드바 메뉴 비활성화
  cover.addEventListener("click", (e) => {
    nav.classList.remove("active");
    cover.classList.remove("active");
    body.classList.remove("fixed");
  }) 

  // Gnb - activate/inactivate lnb menu
  const gnbItems = document.querySelectorAll(".gnb_btn");
  gnbItems.forEach(gnb => gnb.addEventListener("click", () => {
    const lnb = gnb.nextElementSibling;
    const gnbIcon = gnb.querySelector("img");
    gnb.classList.toggle("active");
    lnb.classList.toggle("active");
  }))

  // lnb - 소분류 메뉴 오른쪽 즐겨찾기 아이콘 클릭 시, 즐겨찾기 활성화/비활성화 표시
  const isRootPage = location.pathname.endsWith("index.html") 
                || location.pathname.endsWith("/"); 
  const starPath = isRootPage ? "./assets/images/icons/"    // index.html에서 사용할 경로
                              : "../assets/images/icons/";  // 하위 폴더에서 사용할 경로
  const lnbItems = document.querySelectorAll(".lnb > div > span");
  lnbItems.forEach(item => item.addEventListener("click", (e) => {
    const starIcon = e.currentTarget.querySelector("img");
    if(starIcon.src.includes("starFill20.svg")){
      starIcon.src = starPath + "star.svg"; // 비활성화 상태로 변경
    } else {
      starIcon.src = starPath + "starFill20.svg"; // 활성화 상태로 변경
    }
  }))

  // main tab - activate/inactivate a board category
  const main_tab = document.querySelectorAll(".main_tab");
  main_tab.forEach(tab => tab.addEventListener("click", (e) =>{
    if(tab.classList.contains("active")){
      return;
    }

    const currentActiveTab = document.querySelector(".main_tab.active");
    if(currentActiveTab){
      currentActiveTab.classList.remove("active");
    }

    tab.classList.add("active");
  }))

  // 사이드바 > 로그아웃 메뉴 클릭시, 해당 모달창 활성화
  const logoutMenu = document.querySelectorAll(".logout_btn"); // 로그아웃 메뉴
  logoutMenu.forEach(menu => menu.addEventListener("click", () => {
    const darkBgModal = document.querySelector(".dark_bg_modal"); // 모달창용 불투명 배경
    const logoutModal = document.querySelector(".modal_cont.logout"); // 모달 영역
    darkBgModal.classList.add("active");
    logoutModal.classList.add("active");
  }))

  
  const logoutBtn = document.querySelector(".modal_cont.logout .leave_btn"); // 모달창 > 로그아웃 버튼
  logoutBtn.addEventListener("click", () => {
    const darkBgModal = document.querySelector(".dark_bg_modal"); // 모달창용 불투명 배경
    const logoutModal = document.querySelector(".modal_cont.logout"); // 모달 영역

    // 모달창용 불투명 배경, 모달 영역, 사이드바, 불투명배경, 고정한 body 초기화
    darkBgModal.classList.remove("active");
    logoutModal.classList.remove("active");
    nav.classList.remove("active");
    cover.classList.remove("active");
    body.classList.remove("fixed");
    showSnackbar('Bạn đã đăng xuất. Đang quay lại màn hình trước', 2500, true);

  }) 

          
  // 토스트 / 스낵바 형태로 알림인 경우 - 로그아웃한 경우
  function showSnackbar(message, duration, goBackAfter) {
    const snackbar = document.querySelector(".snack_bar");
    const formattedMessage = message.replace(/\. /, '.\n');
    snackbar.textContent = formattedMessage;
    snackbar.classList.add("show"); //snackbar 활성화
    
    // 기존 hide 제거, show 추가 (보이기 애니메이션)
    snackbar.classList.remove("hide");
    snackbar.classList.add("show");
    snackbar.style.visibility = "visible";
  
    // duration 후 hide 클래스로 전환 (사라짐 애니메이션)
    setTimeout(() => {
      snackbar.classList.remove("show");
      snackbar.classList.add("hide");
  
      // 애니메이션 끝난 후 숨기기 및 이전페이지 이동
      snackbar.addEventListener('animationend', function handler() {
        snackbar.style.visibility = "hidden";
        snackbar.classList.remove("hide");
        snackbar.removeEventListener('animationend', handler);
  
        if (goBackAfter) { // 이전 페이지로 이동 true인 경우
          history.back();
        }
      });
    }, duration);
  }


  // 모달 비활성화 클릭 이벤트(dark_bg_modal 배경, cancel_btn 취소)
  document.querySelectorAll(".modal_leave .cancel_btn, .dark_bg_modal").forEach(closeModalBtn => closeModalBtn.addEventListener("click", () => {
    const darkBgModal = document.querySelector(".dark_bg_modal"); // 모달창용 불투명 배경
    const logoutModal = document.querySelector(".modal_cont.logout"); // 모달 영역

    // 모달창용 불투명 배경, 모달 영역 초기화
    darkBgModal.classList.remove("active");
    logoutModal.classList.remove("active");
  }))  
  
  // 9월 4주차 TOP버튼 활성/비활성화 및 클릭시 스크롤 동작
  window.addEventListener('scroll', function () {
    const topBtn = document.querySelector('.top_btn');
    const scrollY = window.scrollY || window.pageYOffset;
    const clientHeight = window.innerHeight / 3;

    if (scrollY > clientHeight ) {
      topBtn.classList.add("active");
    } else {
      topBtn.classList.remove("active");
    }
  });  
});      