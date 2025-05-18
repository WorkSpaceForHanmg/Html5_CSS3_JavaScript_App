// 전역변수
const API_BASE_URL = "http://localhost:8080";
// 현재 수정 중인 도서 ID
let editingBookId = null;

// DOM 엘리먼트 가져오기
const bookForm = document.getElementById("bookForm");
const bookTableBody = document.getElementById("bookTableBody");
const cancelButton = bookForm.querySelector('.cancel-btn');  // HTML에 취소 버튼 있으면 동작, 없으면 null임
const submitButton = bookForm.querySelector('button[type="submit"]');
const formError = document.getElementById("formError");

// Document Load 이벤트 처리하기
document.addEventListener("DOMContentLoaded", function () {
    loadBooks();
});

// Form Submit 이벤트 처리하기
bookForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // FormData 객체 생성
    const formData = new FormData(bookForm);

    // 사용자 정의 Book 객체 생성 (공백 제거)
    const bookData = {
        title: formData.get("title").trim(),
        author: formData.get("author").trim(),
        isbn: formData.get("isbn").trim(),
        price: parseFloat(formData.get("price")),
        publishDate: formData.get("publishDate") || null,
        language: formData.get("language").trim(),
        pageCount: parseInt(formData.get("pageCount")),
        publisher: formData.get("publisher").trim(),
        edition: formData.get("edition").trim(),
        coverImageUrl: formData.get("coverImageUrl").trim(),
        description: formData.get("description").trim(),
    };

    // 유효성 체크
    if (!validateBook(bookData)) {
        return;
    }

    if (editingBookId) {
        updateBook(editingBookId, bookData);
    } else {
        createBook(bookData);
    }
});

// 데이터 유효성 검사 함수
function validateBook(book) {
    if (!book.title) {
        alert("제목을 입력해주세요.");
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
    // ISBN 형식 검사 (간단하게 10~13자리 숫자 또는 하이픈 포함)
    const isbnPattern = /^[0-9\-]{10,13}$/;
    if (!isbnPattern.test(book.isbn)) {
        alert("올바른 ISBN 형식이 아닙니다.");
        return false;
    }
    if (isNaN(book.price) || book.price < 0) {
        alert("가격을 올바르게 입력해주세요.");
        return false;
    }
    if (book.pageCount && (isNaN(book.pageCount) || book.pageCount <= 0)) {
        alert("페이지 수를 올바르게 입력해주세요.");
        return false;
    }
    // 출판일은 null 또는 yyyy-mm-dd 형식 체크
    if (book.publishDate && !/^\d{4}-\d{2}-\d{2}$/.test(book.publishDate)) {
        alert("출판일 형식이 올바르지 않습니다.");
        return false;
    }
    // URL 형식 체크 (입력된 경우만)
    if (book.coverImageUrl && !isValidUrl(book.coverImageUrl)) {
        alert("표지 이미지 URL이 올바르지 않습니다.");
        return false;
    }
    return true;
}

// URL 유효성 검사 함수
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// 도서 목록 불러오기
function loadBooks() {
    fetch(`${API_BASE_URL}/api/books`)
        .then(response => {
            if (!response.ok) {
                throw new Error("도서 목록을 불러오는데 실패했습니다.");
            }
            return response.json();
        })
        .then(books => renderBookTable(books))
        .catch(error => {
            console.error(error);
            showError("도서 목록을 불러오는데 실패했습니다.");
            bookTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #dc3545;">
                        오류: 데이터를 불러올 수 없습니다.
                    </td>
                </tr>
            `;
        });
}

// 도서 목록 테이블 렌더링
function renderBookTable(books) {
    bookTableBody.innerHTML = "";
    books.forEach(book => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.price?.toLocaleString() ?? '-'}</td>
            <td>${book.publishDate ?? '-'}</td>
            <td>${book.publisher ?? '-'}</td>
            <td>
                <button class="edit-btn" onclick="editBook(${book.id})">수정</button>
                <button class="delete-btn" onclick="deleteBook(${book.id})">삭제</button>
            </td>
        `;
        bookTableBody.appendChild(row);
    });
}

// 도서 등록 함수
function createBook(bookData) {
    fetch(`${API_BASE_URL}/api/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData)
    })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "도서 등록에 실패했습니다.");
            }
            return response.json();
        })
        .then(result => {
            showSuccess("도서가 성공적으로 등록되었습니다!");
            resetForm();
            loadBooks();
        })
        .catch(error => {
            console.error(error);
            showError(error.message);
        });
}

// 도서 삭제 함수
function deleteBook(bookId) {
    if (!confirm(`ID = ${bookId} 인 도서를 정말 삭제하시겠습니까?`)) {
        return;
    }
    fetch(`${API_BASE_URL}/api/books/${bookId}`, { method: "DELETE" })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "도서 삭제에 실패했습니다.");
            }
            showSuccess("도서가 성공적으로 삭제되었습니다!");
            loadBooks();
        })
        .catch(error => {
            console.error(error);
            showError(error.message);
        });
}

// 도서 수정 전 데이터 로드
function editBook(bookId) {
    fetch(`${API_BASE_URL}/api/books/${bookId}`)
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "존재하지 않는 도서입니다.");
            }
            return response.json();
        })
        .then(book => {
            // 폼에 데이터 채우기
            bookForm.title.value = book.title ?? '';
            bookForm.author.value = book.author ?? '';
            bookForm.isbn.value = book.isbn ?? '';
            bookForm.price.value = book.price ?? '';
            bookForm.publishDate.value = book.publishDate ?? '';
            bookForm.language.value = book.language ?? '';
            bookForm.pageCount.value = book.pageCount ?? '';
            bookForm.publisher.value = book.publisher ?? '';
            bookForm.edition.value = book.edition ?? '';
            bookForm.coverImageUrl.value = book.coverImageUrl ?? '';
            bookForm.description.value = book.description ?? '';

            editingBookId = bookId;
            submitButton.textContent = "도서 수정";
            if (cancelButton) cancelButton.style.display = 'inline-block';
        })
        .catch(error => {
            console.error(error);
            showError(error.message);
        });
}

// 폼 초기화 및 수정 모드 해제
function resetForm() {
    bookForm.reset();
    editingBookId = null;
    submitButton.textContent = "도서 등록";
    if (cancelButton) cancelButton.style.display = 'none';
    clearMessages();
}

// 도서 수정 처리
function updateBook(bookId, bookData) {
    fetch(`${API_BASE_URL}/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData)
    })
        .then(async response => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "도서 수정에 실패했습니다.");
            }
            return response.json();
        })
        .then(result => {
            showSuccess("도서가 성공적으로 수정되었습니다!");
            resetForm();
            loadBooks();
        })
        .catch(error => {
            console.error(error);
            showError(error.message);
        });
}

// 성공 메시지 출력
function showSuccess(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.style.display = 'block';
    formError.style.color = '#28a745';
}

// 에러 메시지 출력
function showError(message) {
    if (!formError) return;
    formError.textContent = message;
    formError.style.display = 'block';
    formError.style.color = '#dc3545';
}

// 메시지 초기화
function clearMessages() {
    if (!formError) return;
    formError.style.display = 'none';
}
