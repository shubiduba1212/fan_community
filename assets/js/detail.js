window.addEventListener("DOMContentLoaded", () => {
  // 좋아요 토글 (게시글/댓글 공통)
  function attachLikeHandler(btn) {
    if (!btn || btn._likeBound) return; // 중복 바인딩 방지
    btn._likeBound = true;

    btn.addEventListener('click', (e) => {
      const icon = e.currentTarget.querySelector('img');
      const countSpan = e.currentTarget.classList.contains('like_btn') ? e.currentTarget.querySelector('.like_post_counts') : e.currentTarget.querySelector('span'); // 첫 번째 span이 카운트
      let count = parseInt(countSpan.textContent || '0', 10);

      // 활성화 토글: like.svg / like_comment.svg → likeFill_red.svg
      if (icon.src.includes('like.svg') || icon.src.includes('like_comment.svg')) {
        icon.src = '/assets/images/icons/likeFill_red.svg'; // 활성화
        count += 1; // 좋아요 +1
        countSpan.textContent = String(count);
        countSpan.classList.remove('d_none'); // 숫자 표시
      } else {
        // 비활성화 아이콘으로 복귀
        if (e.currentTarget.classList.contains('like_comment')) {
          icon.src = '/assets/images/icons/like_comment.svg';
        } else {
          icon.src = '/assets/images/icons/like.svg';
        }
        count = Math.max(0, count - 1);
        countSpan.textContent = String(count);

        if (count === 0) {
          countSpan.classList.add('d_none'); // 숫자 숨김
        } else {
          countSpan.classList.remove('d_none'); // 숫자 표시
        }
      }
    });
  }


  // 덧글/댓글 수정 버튼(.edit_comment)
  // - 기존 스크립트 로직을 그대로 따르되, 부분 트리에만 바인드 가능하게 모듈화
  function bindEditButtons(root = document) {
    root.querySelectorAll('.edit_comment').forEach(editBtn => {
      if (editBtn._editBound) return;
      editBtn._editBound = true;

      editBtn.addEventListener('click', () => {
        // 이미 열려있는 대댓글 입력영역 닫기
        const replyBox = editBtn.closest('.comment_item').querySelector('.register_comment_box.reply');
        if (replyBox && replyBox.classList.contains('active')) {
          replyBox.classList.remove('active');
        }

        const commenting = editBtn.closest('.comment_item').querySelector('.comment_box');
        const currentText = commenting.querySelector('.commenting_contents p').textContent;
        commenting.classList.add('active'); // 수정 영역으로 활성화
        commenting.querySelector('textarea').value = currentText; // 기존 텍스트 주입
        if (currentText.trim().length > 0) commenting.querySelector('.submit_btn').classList.remove('disabled');
      });
    });
  }

  function bindDeleteButtons(root = document) {
    root.querySelectorAll('.delete_comment').forEach(deleteBtn => {
      if (deleteBtn._deleteBound) return; // 중복 바인딩 방지
      deleteBtn._deleteBound = true;

      deleteBtn.addEventListener('click', () => {
        // 현재 클릭된 댓글 요소 기억 (삭제 컨텍스트 저장)
        const itemEl = deleteBtn.closest('.comment_item');
        pendingDelete = { type: 'comment', itemEl: itemEl || null };

        // 공통 모달 열기
        activateModal();
        document.querySelector('.modal_delete').classList.add('active');

        // 게시글 메뉴 모달 숨기기 (PC모드 대응)
        const selectMenu = modalCommonContainer?.querySelector('.select_menu ul');
        if (selectMenu) selectMenu.classList.add('d_none');

        // 모달의 "삭제" 버튼 핸들러 (1회성 바인딩)
        const modalDeleteBtn = document.querySelector('.modal_delete .delete_btn');
        if (!modalDeleteBtn) return;

        const handler = () => {
          if (!pendingDelete || !pendingDelete.itemEl) return;

          // 댓글 내용 영역 찾기
          const contents = pendingDelete.itemEl.querySelector('.commenting_contents');
          if (contents) {
            // 대댓글 입력창 열려 있으면 닫기
            const replyBox = pendingDelete.itemEl.querySelector('.register_comment_box.reply');
            if (replyBox && replyBox.classList.contains('active')) {
              replyBox.classList.remove('active');
            }

            // 삭제 처리
            contents.classList.add('deleted');
            const p = contents.querySelector('p');
            if (p) p.textContent = 'Bình luận này đã bị xóa.'; // “삭제된 댓글입니다.”
            const bottom = contents.querySelector('.commenting_bottom');
            if (bottom) bottom.remove(); // 버튼/좋아요 영역 제거
          }

          // 스낵바 표시
          showSnackbar('Bài viết đã bị xóa. Đang quay lại trang trước.', 3000, false);

          // 모달 닫기 (취소 버튼 클릭으로 통합)
          const cancelBtn = document.querySelector('.modal_delete .cancel_btn');
          if (cancelBtn) cancelBtn.click();

          // 삭제 컨텍스트 초기화
          pendingDelete = null;
        };

        // 중복 바인딩 방지 + 1회성 실행
        modalDeleteBtn.addEventListener('click', handler, { once: true });
      });
    });
  }

  // 정적 요소 초기 바인딩
  bindEditButtons(document);
  bindDeleteButtons(document);

  document.querySelectorAll('.comment_form textarea, .comment_box.active textarea').forEach(ta => {
    if (ta._taBound) return;
    ta._taBound = true;

    ta.addEventListener('input', () => {
      const form = ta.closest('.comment_form') ? ta.closest('.comment_form') : ta.closest('.comment_box');
      const btn = form && form.querySelector('.submit_btn');
      if (!btn) return;
      const hasText = ta.value.trim().length > 0;
      btn.classList.toggle('disabled', !hasText);
    });
  });

  // 08/22 추가 사항
  // 좋아요 ♥ 하트 아이콘 클릭 시, 아이콘 이미지 활성/비활성화 변경 & 좋아요 수 증가/감소
  document.querySelectorAll('.like_btn, .like_comment').forEach(attachLikeHandler);


  // 덧글/댓글 입력 영역 활성화 시, 덧글/댓글 입력 영역 UI 변경
  document.querySelector('.register_comment_box.comment textarea').addEventListener('click', (e) => {
    if (!e.currentTarget.classList.contains('active')) {
      const commentBox = e.currentTarget.closest('.register_comment_box');
      commentBox.classList.add('active');
      commentBox.querySelector('textarea').focus();
    }
  });

  // 댓글 입력 영역 내 취소 버튼(Hủy) 클릭 시, 댓글 입력 영역 비활성화
  document.querySelectorAll('.commenting_options .cancel_btn').forEach(btn => {
    btn.addEventListener('click', (e) => {

      if (e.currentTarget.closest('.register_comment_box')) {
        const commentBox = e.currentTarget.closest('.register_comment_box');
        commentBox.classList.remove('active');
        commentBox.querySelector('textarea').value = ''; // 입력된 내용 초기화
      }

      if (btn.closest(".comment_box")) { // 덧글/답글/댓글 수정 영역인 경우
        const currentComment = btn.closest('.comment_item').querySelector('.commenting_contents p').textContent;
        if (currentComment === '') {
          btn.closest(".comment_item").classList.add('d_none');
        } else {
          btn.closest(".comment_box").classList.remove('active');
        }
        btn.closest(".comment_box").querySelector("textarea").value = '';
      }
    });
  });

  // 댓글 입력 영역 내 등록 버튼(Đăng bài) 클릭 시, 입력한 댓글 내용으로 추가 or 수정
  document.querySelectorAll('.commenting_options .submit_btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.classList.contains('disabled')) {
        return; // 등록 버튼이 비활성화 상태면 무시
      }
      // const newComment = document.querySelector('.comments_list .comment_item.first');
      const newComment = e.currentTarget.closest('.comment_form') ? document.querySelector('.comments_list .comment_item') : e.currentTarget.closest('.comment_item').classList.contains('reply') ? document.querySelector('.comments_list .comment_item.reply') : document.querySelector('.comments_list .comment_item');
      if (newComment.classList.contains('d_none')) newComment.classList.remove('d_none'); // 테스트용: 새 댓글 항목 표시 

      const textarea = e.currentTarget.closest('.comment_form') ? e.currentTarget.closest('.register_comment_box').querySelector('textarea').value : e.currentTarget.closest('.comment_box').querySelector('textarea').value;
      const originalText = newComment.querySelector('.commenting_contents p').textContent;

      const uploadDate = new Date(); // 댓글 등록 시간
      const formattedDate = [uploadDate.getDate(), uploadDate.getMonth() + 1, uploadDate.getFullYear()].map(n => String(n).padStart(2, '0')).join('.');
      const formattedTime = uploadDate.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      newComment.querySelector('.commenting_contents p').textContent = textarea;
      newComment.querySelector('.upload_date span').textContent = formattedDate;
      newComment.querySelector('.upload_time').textContent = formattedTime;

      if (e.currentTarget.closest('.register_comment_box')) {
        const commentBox = e.currentTarget.closest('.register_comment_box');
        commentBox.classList.remove('active');
        commentBox.querySelector('textarea').value = ''; // 입력된 내용 초기화
      }

      if (btn.closest(".comment_box")) { // 덧글/답글/댓글 수정 영역인 경우
        btn.closest(".comment_box").classList.remove("active");
        btn.closest(".comment_box").querySelector("textarea").value = '';
      }

    });
  });

  // 답글 작성 버튼 (Trả lời) 클릭 시, 답글 입력 영역 활성화
  document.querySelector('.comment_item.first .send_comment').addEventListener('click', () => {
    if (!document.querySelector('.comment_item.reply').classList.contains('d_none')) return;
    const replyComment = document.querySelector('.comment_item.reply.d_none');
    replyComment.classList.remove('d_none');
  });

  // 모달 관련 이벤트
  const darkBg = document.querySelector(".dark_bg_modal"); // 모달 뒤 투명한 검은색 배경
  const darkBgTransparent = document.querySelector(".dark_bg"); // 모달 뒤 투명한 배경
  const body = document.querySelector("body"); // body태그
  const modalCommonContainer = document.querySelector(".common_modal"); // 공통 모달 영역(화면 정가운데 등장)
  const selectPostMenu = document.querySelector(".select_menu ul"); // 게시글 ⋮ 더보기 메뉴

  // 모달 비활성화 공통 함수 (중복 코드 제거용)
  function closeModal(target) {
    if (target.closest('.modal_cont') !== null) { // 클릭된 대상이 공통모달을 사용하지 않는 모달인 경우
      document.querySelector(".modal_cont_more").classList.remove("active");
      document.querySelector(".modal_cont_share").classList.remove("active");
      darkBgTransparent.classList.remove("active");
    } else { // 모바일 모드 모달 내부인 경우
      modalCommonContainer.classList.remove("active");
      modalCommonContainer.querySelector(".select_menu ul").classList.add("d_none"); // 게시글 메뉴 모달 숨기기
      selectPostMenu.classList.add("d_none"); // 게시글 ⋮ 더보기 메뉴 모달 숨기기
    }
    darkBg.classList.remove("active");
    body.classList.remove("fixed");
    document.querySelectorAll(".modal_delete, .modal_link, .modal_report").forEach(modal => modal.classList.remove("active"));
  }

  // 공통 모달 활성화 기본 설정
  function activateModal() {
    darkBg.classList.add("active"); // 모달 뒤 투명한 검은색 배경 활성화
    body.classList.add("fixed"); // 모달 활성화시 스크롤 방지
    modalCommonContainer.classList.add("active"); // 모달 영역 활성화
  }

  // 게시글 ⋮ 더보기 메뉴 클릭시 모달 활성화
  document.querySelector(".post_more_menu").addEventListener("click", (e) => {
    // PC모드인지 확인    
    if (window.innerWidth > 1280) { // PC모드
      document.querySelector(".modal_cont_more").classList.add("active");
      darkBgTransparent.classList.add("active");
    } else {
      //공통 모달 활성화
      activateModal();
      // 로그인한 사용자가 게시글 작성자인 경우
      const selectPostMenu = modalCommonContainer.querySelector(".select_menu ul");
      selectPostMenu.classList.remove("d_none"); // 해당 ul 활성화
    }

  })

  // 공유 모달 위치 조정 함수
  function adjustModalPositionRelativeToButton() {
    const modal = document.querySelector('.modal_cont_share');
    const button = document.querySelector('.detail_bottom .share_btn');
    if (!modal || !button) return;

    const buttonRect = button.getBoundingClientRect(); // 뷰포트 내 위치
    const scrollY = window.scrollY;
    const buttonTopOnScreen = buttonRect.top;
    const buttonHeight = button.offsetHeight;
    const modalHeight = modal.offsetHeight;

    // 기준: 화면의 중간보다 위에 있으면 아래로 띄우고, 아래에 있으면 위로 띄우기
    const screenMiddle = window.innerHeight / 2;
    let newTop;

    if (buttonTopOnScreen < screenMiddle) {
      // 버튼이 화면 위쪽에 있음 → 모달을 버튼 아래에 띄우기
      newTop = 36; // 여백 8px
    } else {
      // 버튼이 화면 아래쪽에 있음 → 모달을 버튼 위에 띄우기
      newTop = -128; // 여백 8px
    }

    modal.style.top = `${newTop}px`;
  }

  // PC모드 - 게시글 공유 메뉴 및 공유 아이콘 버튼 클릭시, 해당 모달 활성화
  document.querySelector(".detail_bottom .share_btn").addEventListener("click", () => {
    if (window.innerWidth < 1280) {
      darkBg.classList.add("active"); // 모바일 모드용 투명한 검은색 배경 활성화
      body.classList.add("fixed"); // 모달 활성화시 스크롤 방지
    } else {
      // 현재 스크롤 위치
      adjustModalPositionRelativeToButton();
      darkBgTransparent.classList.add("active"); // PC모드용 투명한 dark_bg 활성화
    }
    document.querySelector(".modal_cont_share").classList.add("active"); // PC모드용 모달 영역 활성화
    document.querySelector(".modal_link").classList.add("active"); // 링크 공유 모달 활성화
  })

  // 게시글 신고 메뉴 및 답글/댓글 신고 버튼 클릭시, 해당 모달 활성화
  document.querySelectorAll(".report_menu, .report_comment").forEach(shareBtn => shareBtn.addEventListener("click", () => {
    document.querySelector(".common_modal .select_menu ul").classList.add("d_none"); // 게시글 메뉴 모달 숨기기
    activateModal(); // 공통 모달창 활성화
    document.querySelector(".modal_report").classList.add("active"); // 신고 모달 활성화
  })
  )

  // 신고 모달창 > 신고 유형 선택할 시, 하단 신고 버튼 활성화
  document.querySelectorAll('input[type="radio"]').forEach(radioBtn => radioBtn.addEventListener("change", () => {
    radioBtn.closest(".modal_report").querySelector(".report_btn").disabled = false;
  })
  )

  // 신고 모달창 > 취소/신고 버튼, 배경 클릭시, 신고 모달 초기화
  document.querySelectorAll('.report_btn, .modal_report .cancel_btn, .dark_bg').forEach(btn => btn.addEventListener("click", (e) => {
    document.querySelector(".report_btn").disabled = true;
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false;
    });
  })
  )

  // 게시글 ⋮ 더보기 메뉴 > 수정/삭제/링크공유 메뉴 클릭시, 게시글 ⋮ 더보기 메뉴 모달 비활성화
  document.querySelectorAll(".select_menu > ul li").forEach(postMenu => postMenu.addEventListener("click", () => {
    if (window.innerWidth < 1280) { // 모바일 모드에서만 동작하도록      
      const selectPostMenu = document.querySelector(".select_menu ul");
      selectPostMenu.classList.add("d_none"); // ⋮ 더보기 메뉴 비활성화
    }
  }))

  // 모달 비활성화 클릭 이벤트(dark_bg 배경, close_btn 닫기, cancel_btn 취소, delete_btn 삭제, share_facebook_btn 페이스북 공유, link_copy_btn 링크복사)
  document.querySelectorAll(".report_btn, .close_btn, .cancel_btn, .share_facebook_btn").forEach(closeModalBtn => closeModalBtn.addEventListener("click", (e) => {
    closeModal(e.target);
  }))

  document.querySelector(".link_copy_btn").addEventListener("click", (e) => {
    if (window.innerWidth < 1280) { // 모바일 모드에서만 동작하도록
      closeModal(e.target);
    } else {
      document.querySelector(".detail_bottom .modal_cont_share").classList.remove("active"); // 링크 공유 모달 비활성화
      darkBgTransparent.classList.remove("active");
      body.classList.remove("fixed");
    }
  })

  // 10월 3주차 수정사항 - PC모드용 dark_bg 비활성화 함수 분리
  document.querySelector(".dark_bg").addEventListener("click", (e) => {
    if (window.innerWidth <= 1280) return; // 모바일 모드에서는 동작하지 않도록 방지
    document.querySelector(".modal_cont_share").classList.remove("active"); // 링크 공유 모달 비활성화
    document.querySelector(".modal_cont_more").classList.remove("active"); // ⋮ 더보기 메뉴 모달 비활성화
    darkBgTransparent.classList.remove("active");
    body.classList.remove("fixed");
  })

  // 10월 3주차 수정사항 - PC모드용 dark_bg 비활성화 함수 분리
  document.querySelector(".dark_bg_modal").addEventListener("click", (e) => {
    if (window.innerWidth < 1280) { // PC모드
      selectPostMenu.classList.add("d_none"); // 게시글 ⋮ 더보기 메뉴 모달 숨기기
    }
    modalCommonContainer.classList.remove("active");
    darkBg.classList.remove("active");
    darkBgTransparent.classList.remove("active");
    body.classList.remove("fixed");
    document.querySelectorAll(".modal_delete, .modal_link, .modal_report, .modal_cont_share, .modal_cont_more").forEach(modal => modal.classList.remove("active"));
  })

  // 토스트 / 스낵바 형태로 알림인 경우 - 게시글 수정 / 삭제 / 링크 복사 
  function showSnackbar(message, duration, goBackAfter) {
    const snackbar = document.querySelector(".snack_bar");
    let formattedMessage = "";
    if (window.innerWidth > 1280) { // PC모드
      formattedMessage = message;
    } else {
      formattedMessage = message.replace(/\. /, '.\n');
    }
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

  // 링크 복사 함수
  function copyLink() {
    const url = window.location.href; // 현재 페이지 URL    
    navigator.clipboard.writeText(url);// 클립보드에 복사
  }

  // order post - Lastest(default) / Hot&Popular
  const orderItems = document.querySelectorAll(".order_list li");
  orderItems.forEach(item => item.addEventListener("click", (e) => {
    if (item.classList.contains("active")) {
      return;
    }

    const currentOrder = document.querySelector(".order_list li.active");
    if (currentOrder) {
      currentOrder.classList.remove("active");
    }

    item.classList.add("active");
  }))

  // scroll to comments
  document.querySelector('.scroll_to_comment').addEventListener('click', (e) => {
    const target = document.querySelector('section.comments');

    if (!target) return;

    const offset = 138;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  });

  // pagination
  const paginationItems = document.querySelectorAll(".page_num_btn");
  paginationItems.forEach(item => item.addEventListener("click", (e) => {
    if (item.classList.contains("active")) {
      return;
    }

    const currentPage = document.querySelector(".page_num_btn.active");
    if (currentPage) {
      currentPage.classList.remove("active");
    }

    item.classList.add("active");
  }))

  const startBtn = document.querySelector(".start_page_btn");
  const prevBtn = document.querySelector(".prev_btn");
  const nextBtn = document.querySelector(".next_btn");
  const endBtn = document.querySelector(".end_page_btn");

  startBtn.addEventListener("click", () => {
    updateActiveByIndex(0);
  });

  endBtn.addEventListener("click", () => {
    updateActiveByIndex(paginationItems.length - 1);
  });

  prevBtn.addEventListener("click", () => {
    const currentIndex = getCurrentActiveIndex();
    if (currentIndex > 0) {
      updateActiveByIndex(currentIndex - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    const currentIndex = getCurrentActiveIndex();
    if (currentIndex < paginationItems.length - 1) {
      updateActiveByIndex(currentIndex + 1);
    }
  });

  // 현재 활성화된 페이지 인덱스를 가져오는 함수
  function getCurrentActiveIndex() {
    return Array.from(paginationItems).findIndex(item =>
      item.classList.contains("active")
    );
  }

  // 페이지 인덱스 활성화/비활성화 함수
  function updateActiveByIndex(index) {
    const currentPage = document.querySelector(".page_num_btn.active");
    if (currentPage) currentPage.classList.remove("active");

    paginationItems[index].classList.add("active");
  }
});