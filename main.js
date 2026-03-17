/**
 * 랜덤 자리 번호 뽑기 Logic
 */

class SeatPicker {
  constructor() {
    this.maxSeatsInput = document.getElementById('max-seats');
    this.groupCountInput = document.getElementById('group-count');
    this.currentNumberDisplay = document.getElementById('current-number');
    this.groupBadge = document.getElementById('group-display');
    this.statusMessage = document.getElementById('status-message');
    this.historyList = document.getElementById('history-list');
    this.btnPick = document.getElementById('btn-pick');
    this.btnPickAll = document.getElementById('btn-pick-all');
    this.btnReset = document.getElementById('btn-reset');

    this.allSeats = [];
    this.pickedSeats = [];
    this.isAnimating = false;

    this.init();
  }

  init() {
    this.btnPick.addEventListener('click', () => this.pickNumber());
    this.btnPickAll.addEventListener('click', () => this.pickAll());
    this.btnReset.addEventListener('click', () => this.reset());
    this.maxSeatsInput.addEventListener('change', () => this.handleConfigChange());
    this.groupCountInput.addEventListener('change', () => this.handleConfigChange());
    
    this.handleConfigChange();
  }

  handleConfigChange() {
    const max = parseInt(this.maxSeatsInput.value);
    const groups = parseInt(this.groupCountInput.value);

    if (isNaN(max) || max < 1) {
      this.statusMessage.textContent = '올바른 총 좌석 수를 입력해주세요.';
      this.toggleButtons(true);
      return;
    }

    if (isNaN(groups) || groups < 1) {
      this.statusMessage.textContent = '올바른 묶음 수를 입력해주세요.';
      this.toggleButtons(true);
      return;
    }

    if (groups > max) {
      this.statusMessage.textContent = '묶음 수는 총 좌석 수보다 클 수 없습니다.';
      this.toggleButtons(true);
      return;
    }

    if (this.pickedSeats.length > 0) {
      if (!confirm('설정을 변경하면 진행 상황이 초기화됩니다. 계속하시겠습니까?')) {
        this.maxSeatsInput.value = this.allSeats.length;
        return;
      }
      this.reset();
    }

    this.allSeats = Array.from({ length: max }, (_, i) => i + 1);
    this.groupCount = groups;
    this.toggleButtons(false);
    this.statusMessage.textContent = `${max}개의 좌석을 ${groups}개의 묶음으로 나눕니다.`;
  }

  toggleButtons(disabled) {
    this.btnPick.disabled = disabled;
    this.btnPickAll.disabled = disabled;
  }

  async pickNumber() {
    if (this.isAnimating) return;

    const remainingSeats = this.allSeats.filter(s => !this.pickedSeats.includes(s));

    if (remainingSeats.length === 0) {
      this.statusMessage.textContent = '모든 자리가 다 뽑혔습니다!';
      this.toggleButtons(true);
      return;
    }

    this.isAnimating = true;
    this.toggleButtons(true);
    this.groupBadge.classList.remove('show');

    // 애니메이션 효과 (롤링)
    const rollingDuration = 800;
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
    this.processChosenSeat(chosenNumber);
    
    const remainingCount = remainingSeats.length - 1;
    this.statusMessage.textContent = remainingCount > 0 
      ? `남은 좌석: ${remainingCount}개` 
      : '모든 좌석이 지정되었습니다!';

    this.isAnimating = false;
    if (remainingCount > 0) {
      this.toggleButtons(false);
    }
  }

  async pickAll() {
    if (this.isAnimating) return;

    const remainingSeats = this.allSeats.filter(s => !this.pickedSeats.includes(s));
    if (remainingSeats.length === 0) return;

    if (!confirm(`남은 ${remainingSeats.length}개의 좌석을 모두 뽑으시겠습니까?`)) return;

    this.isAnimating = true;
    this.toggleButtons(true);

    // 셔플 (Fisher-Yates)
    for (let i = remainingSeats.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingSeats[i], remainingSeats[j]] = [remainingSeats[j], remainingSeats[i]];
    }

    // 하나씩 배정하는 시각적 연출
    for (let i = 0; i < remainingSeats.length; i++) {
      const seat = remainingSeats[i];
      this.processChosenSeat(seat);
      this.currentNumberDisplay.textContent = seat;
      
      // 너무 많으면 빠르게, 적으면 천천히
      const delay = Math.max(20, 200 - (i * 10));
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.statusMessage.textContent = '모든 좌석이 지정되었습니다!';
    this.isAnimating = false;
  }

  processChosenSeat(chosenNumber) {
    const seatsPerGroup = this.allSeats.length / this.groupCount;
    const groupNum = Math.ceil(chosenNumber / seatsPerGroup);

    this.pickedSeats.push(chosenNumber);
    
    // 그룹 표시 업데이트
    this.groupBadge.textContent = `${groupNum}번 묶음`;
    this.groupBadge.classList.add('show');

    // 애니메이션 피드백
    this.currentNumberDisplay.style.animation = 'none';
    void this.currentNumberDisplay.offsetWidth;
    this.currentNumberDisplay.style.animation = 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    this.updateHistory(chosenNumber, groupNum);
  }

  updateHistory(number, group) {
    const emptyMsg = this.historyList.querySelector('.empty-msg');
    if (emptyMsg) emptyMsg.remove();

    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <span class="group-label">${group}번 묶음</span>
      <span class="seat-num">${number}</span>
    `;
    
    this.historyList.insertBefore(item, this.historyList.firstChild);
  }

  reset() {
    if (this.isAnimating) return;

    this.pickedSeats = [];
    this.currentNumberDisplay.textContent = '?';
    this.groupBadge.classList.remove('show');
    this.historyList.innerHTML = '<p class="empty-msg">아직 뽑힌 번호가 없습니다.</p>';
    this.handleConfigChange();
    this.toggleButtons(false);
  }
}

// 앱 실행
document.addEventListener('DOMContentLoaded', () => {
  new SeatPicker();
});
