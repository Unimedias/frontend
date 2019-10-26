fetch('http://localhost:3000/student')
  .then(response => {
    if (response.status >= 400) {
      return response.json().then(errResData => {
        // TODO: Elaborar uma forma de avisar ao usuário (na tela) sobre erros
        const error = new Error('Something went wrong requesting your data');
        error.data = errResData;
        throw error;
      });
    }

    return response.json();
  }).then(data => {
    // TODO: Gerar as matérias de forma automática a partir dos dados recebidos
    console.log(data);

    const subjects = document.querySelectorAll('.subject');

    subjects.forEach(subject => {
      const title = subject.querySelector('.subject-title');
      const grades = subject.querySelector('.subject-inside');

      title.addEventListener('click', evt => {
        expandSubject(title, grades);
      });

      grades.addEventListener('input', evt => {
        update(grades);
      });
    });

    window.onresize = () => setTimeout(() => on_resize(subjects), 100);
    on_resize(subjects);
  });

const on_resize = subjects => {
  if (document.body.offsetWidth < 540) {
    return;
  }

  subjects.forEach(subject => {
    const title = subject.querySelector('.subject-title');
    const grades = subject.querySelector('.subject-inside');

    if (document.body.offsetWidth >= 540) {
      subject.classList.add('subject-open');
      grades.classList.remove('subject-collapse');
      title.classList.add('subject-title-dark');
    }
    else {
      subject.classList.remove('subject-open');
      grades.classList.add('subject-collapse');
      title.classList.remove('subject-title-dark');
    }
  });
}

const expandSubject = (head, body)  => {
  if (document.body.offsetWidth >= 540) {
    return;
  }

  head.classList.toggle('subject-title-dark');
  body.classList.toggle('subject-collapse');
};

const isNumber = num => {
  return !isNaN(parseFloat(num));
}

const clamp = num => {
  return Math.min(Math.max(num, 0), 10);
}

const update = grades => {
  const exams = grades.querySelectorAll('.subject-p');
  const assigns = grades.querySelectorAll('.subject-t');

  // Used to count how many boxes have valid inputs
  let countExams = 0;
  let countAssigns = 0;

  let sumExams = 0;
  let sumAssigns = 0;

  const subs = grades.querySelectorAll('.subject-ps');
  const ps1 = subs[0];
  const ps2 = subs[1];

  let ps1val = 0;
  let ps2val = 0;

  if (isNumber(ps1.value)) {
    ps1.value = ps1val = clamp(ps1.value);
  }

  if (isNumber(ps2.value)) {
    ps2.value = ps2val = clamp(ps2.value);
  }

  exams.forEach(exam => {
    if (isNumber(exam.value)) {
      exam.value = clamp(exam.value);
      countExams++;

      // Check if sub value is greater than normal exam value
      if ((exam.name === 'P1' || exam.name === 'P2') && ps1val > parseFloat(exam.value)) {
        sumExams += ps1val;
      } else if ((exam.name === 'P3' || exam.name === 'P4') && ps2val > parseFloat(exam.value)) {
        sumExams += ps2val;
      } else {
        sumExams += parseFloat(exam.value);
      }
    }
  });

  assigns.forEach(assign => {
    if (isNumber(assign.value)) {
      assign.value = clamp(assign.value);
      countAssigns++;
      sumAssigns += parseFloat(assign.value);
    }
  });

  const partialExams = Math.round(sumExams / countExams * 10) / 10;
  const partialAssigns = Math.round(sumAssigns / countAssigns * 10) / 10;
  const finalExams = Math.round(sumExams / exams.length * 10) / 10;
  const finalAssigns = Math.round(sumAssigns / assigns.length * 10) / 10;
  const partialTotal = Math.round((partialExams + partialAssigns) / 2 * 10) / 10;
  const finalTotal = Math.round((finalExams + finalAssigns) / 2 * 10) / 10;

  // In the case of no inserted values, the partial will divide by zero and result in a NaN
  // If that happens, check for a NaN and set the result to '' instead
  grades.querySelector('.subject-p-partial').innerText = isNaN(partialExams) ? '' : partialExams;
  grades.querySelector('.subject-t-partial').innerText = isNaN(partialAssigns) ? '' : partialAssigns;
  grades.querySelector('.subject-total-partial').innerText = isNaN(partialTotal) ? '' : partialTotal;
  grades.querySelector('.subject-p-final').innerText = isNaN(finalExams) ? '' : finalExams;
  grades.querySelector('.subject-t-final').innerText = isNaN(finalAssigns) ? '' : finalAssigns;
  grades.querySelector('.subject-total-final').innerText = isNaN(finalTotal) ? '' : finalTotal;
};

const insertTemplate = (withId, atTarget, beforeElement) => {
  const template = document.getElementById(withId);
  const clone = template.content.cloneNode(true);

  atTarget.insertBefore(clone, beforeElement);
}
