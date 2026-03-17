/**
 * 랜덤 자리 번호 뽑기 Logic
 */

class SeatPicker {
  constructor() {
    this.maxSeatsInput = document.getElementById('max-seats');
    this.currentNumberDisplay = document.getElementById('current-number');
    this.statusMessage = document.getElementById('status-message');
    this.historyList = document.getElementById('history-list');
    this.btnPick = document.getElementById('btn-pick');
    this.btnReset = document.getElementById('btn-reset');

    this.allSeats = [];
    this.pickedSeats = [];
    this.isAnimating = false;

    this.init();
  }

  init() {
    this.btnPick.addEventListener('click', () => this.pickNumber());
    this.btnReset.addEventListener('click', () => this.reset());
    this.maxSeatsInput.addEventListener('change', () => this.handleMaxSeatsChange());
    
    // 초기 배열 생성
    this.handleMaxSeatsChange();
  }

  handleMaxSeatsChange() {
    const max = parseInt(this.maxSeatsInput.value);
    if (isNaN(max) || max < 1) {
      this.statusMessage.textContent = '올바른 숫자를 입력해주세요.';
      this.btnPick.disabled = true;
      return;
    }

    if (this.pickedSeats.length > 0) {
      if (!confirm('좌석 수를 변경하면 진행 상황이 초기화됩니다. 계속하시겠습니까?')) {
        this.maxSeatsInput.value = this.allSeats.length;
        return;
      }
      this.reset();
    }

    this.allSeats = Array.from({ length: max }, (_, i) => i + 1);
    this.btnPick.disabled = false;
    this.statusMessage.textContent = `1부터 ${max}까지의 숫자를 뽑을 수 있습니다.`;
  }

  async pickNumber() {
    if (this.isAnimating) return;

    const remainingSeats = this.allSeats.filter(s => !this.pickedSeats.includes(s));

    if (remainingSeats.length === 0) {
      this.statusMessage.textContent = '모든 자리가 다 뽑혔습니다!';
      this.btnPick.disabled = true;
      return;
    }

    this.isAnimating = true;
    this.btnPick.disabled = true;

    // 애니메이션 효과 (롤링)
    const rollingDuration = 1000; // 1초
    const intervalTime = 50;
    const steps = rollingDuration / intervalTime;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      const tempRandom = Math.floor(Math.random() * this.allSeats.length) + 1;
      this.currentNumberDisplay.textContent = tempRandom;
      currentStep++;

      if (currentStep >= steps) {
        clearInterval(interval);
        this.finalizePick(remainingSeats);
      }
    }, intervalTime);
  }

  finalizePick(remainingSeats) {
    const randomIndex = Math.floor(Math.random() * remainingSeats.length);
    const chosenNumber = remainingSeats[randomIndex];

    this.pickedSeats.push(chosenNumber);
    this.currentNumberDisplay.textContent = chosenNumber;
    this.currentNumberDisplay.style.animation = 'none';
    void this.currentNumberDisplay.offsetWidth; // Reflow
    this.currentNumberDisplay.style.animation = 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    this.updateHistory(chosenNumber);
    
    const remainingCount = remainingSeats.length - 1;
    this.statusMessage.textContent = remainingCount > 0 
      ? `남은 좌석: ${remainingCount}개` 
      : '축하합니다! 마지막 자리까지 모두 뽑았습니다.';

    this.isAnimating = false;
    if (remainingCount > 0) {
      this.btnPick.disabled = false;
    }
  }

  updateHistory(number) {
    // 처음에 있는 "아직 뽑힌 번호가 없습니다" 제거
    const emptyMsg = this.historyList.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = number;
    
    // 가장 최근 번호가 앞에 오도록
    this.historyList.insertBefore(item, this.historyList.firstChild);
  }

  reset() {
    if (this.isAnimating) return;

    this.pickedSeats = [];
    this.currentNumberDisplay.textContent = '?';
    this.historyList.innerHTML = '<p class="empty-msg">아직 뽑힌 번호가 없습니다.</p>';
    this.handleMaxSeatsChange();
    this.btnPick.disabled = false;
  }
}

// 앱 실행
document.addEventListener('DOMContentLoaded', () => {
  new SeatPicker();
});
