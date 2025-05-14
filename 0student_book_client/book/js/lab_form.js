//전역변수
const API_BASE_URL = "http://localhost:8080";

//DOM 엘리먼트 가져오기
const bookForm = document.getElementById("bookForm");
const bookTableBody = document.getElementById("bookTableBody");

// 페이지가 로드되면 도서 목록을 로드
document.addEventListener("DOMContentLoaded", function () {
    loadBooks();
});

// 도서 등록 폼 제출 이벤트 처리
bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("bookForm 제출 되었음...");

    // FormData 객체 생성
    const bookFormData = new FormData(bookForm);
    bookFormData.forEach((value, key) => {
        console.log(key + ' = ' + value);

    });

    // 도서 객체 생성
    const bookData = {
        title: bookFormData.get("title").trim(),
        author: bookFormData.get("author").trim(),
        isbn: bookFormData.get("isbn").trim(),
        price: bookFormData.get("price").trim(),
        publishDate: bookFormData.get("publishDate"),
    };

    //유효성 체크하기
    if (!validateBook(bookData)) {
        //검증체크 실패하면 리턴하기
        return;
    }
    //유효한 데이터 출력
    console.log(bookData);
});

//데이터 유효성을 체크하는 함수
function validateBook(book) {
    // 필수 필드 검사
    if (!book.title) {
        alert("책 제목을 입력해주세요.");
        return false;
    }

    if (!book.author) {
        alert("저자를 입력해주세요.");
        return false;
    }

    if (!book.isbn) {
        alert("ISBN을 입력해주세요.");
        return false;
    }

    if (!book.price) {
        alert("가격을 입력해주세요.");
        return false;
    }

    if (!book.publishDate) {
        alert("출판일을 입력해주세요.");
        return false;
    }

    // ISBN 형식 검사 (예: 13자리 숫자)
    const isbnPattern = /^\d{13}$/;
    if (!isbnPattern.test(book.isbn)) {
        alert("ISBN은 13자리 숫자만 입력 가능합니다.");
        return false;
    }

    // 가격은 양수여야 한다
    if (book.price <= 0) {
        alert("가격은 0보다 큰 값이어야 합니다.");
        return false;
    }

    return true;
}



//도서목록 로드 함수
function loadBooks() {
    console.log("도서 목록 로드 중.....");
}