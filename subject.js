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
    console.log(data);

    const $subjects = document.querySelector('.subjects');

    const { years } = data;

    const { subjects } = years[years.length - 1];

    const maxNumberOfGrades = maxGradesNumberOfAll(subjects);

    subjects.forEach(({ name, exams, assigns }) => {
      insertTemplate('subject', $subjects);

      const $subject = $subjects.lastElementChild;
      const $header = $subject.querySelector('.subject-header');
      const $grades = $subject.querySelector('.subject-body .subject-grades');
      const $stats = $subject.querySelectorAll('.subject-body .subject-stats .subject-stat-wrapper');

      $header.innerText = name;
      $grades.style.height = `${Math.min(maxNumberOfGrades, 8) * 43}px`; // 43 is the height, in px, of each grade

      if (exams.length) {
        setGradesAt($grades, exams, name, 'subject-grade-exam');
        setStatsAt($stats, ['Média de Prova', 'Média de Prova'], ['subject-stat-partial-exam', 'subject-stat-final-exam'])
      }

      if (assigns.length) {
        setGradesAt($grades, assigns, name, 'subject-grade-assign');
        setStatsAt($stats, ['Média de Trabalho', 'Média de Trabalho'], ['subject-stat-partial-assign', 'subject-stat-final-assign'])
      }

      setStatsAt($stats, ['Média Parcial', 'Média Final'], ['subject-stat-partial-total', 'subject-stat-final-total'])
    });

    setupSubjects('subject-stat');
  });

const maxGradesNumberOfAll = subjects => {
  let max = 0;

  subjects.forEach(({ exams, assigns }) => {
    max = Math.max(max, exams.length, assigns.length);
  });

  return max;
}

const insertTemplate = (withId, $atTarget) => {
  const $template = document.getElementById(withId);
  const $clone = $template.content.cloneNode(true);

  $atTarget.appendChild($clone);
}

const setGradesAt = ($target, withData, ofSubjectNamed, withClass) => {
  let $grades = null;

  withData.forEach(({ label, grade }, index) => {
    if (index % 8 === 0) {
      insertTemplate('subject-grade-wrapper', $target);
      $grades = $target.lastElementChild;
    }

    insertTemplate('subject-grade', $grades);

    const $grade = $grades.lastElementChild;
    const $label = $grade.querySelector('label');
    const $score = $grade.querySelector('input');

    $label.setAttribute('for', `${ofSubjectNamed} - ${label}`);
    $label.innerText = label;

    $score.setAttribute('name', `${ofSubjectNamed} - ${label}`);
    $score.setAttribute('id', `${ofSubjectNamed} - ${label}`);
    $score.setAttribute('class', withClass);
    $score.value = grade;
  });
}

const setStatsAt = ($targets, withLabels, andClasses) => {
  $targets.forEach(($stat, index) => {
    insertTemplate('subject-stat', $stat);

    const $last = $stat.lastElementChild;
    const $label = $last.querySelector('label');
    const $score = $last.querySelector('span');

    $label.innerText = withLabels[index];
    $score.setAttribute('class', andClasses[index]);
  });
}

const setupSubjects = () => {
  const $subjects = document.querySelectorAll('.subject');

  $subjects.forEach(subject => {
    const $header = subject.querySelector('.subject-header');
    const $body = subject.querySelector('.subject-body');

    updateSubjectStats($body);

    $body.addEventListener('change', evt => {
      updateSubjectStats($body);
    });

    if (document.body.offsetWidth >= 540) {
      $header.classList.add('subject-header-dark');
      $body.classList.remove('subject-body-collapse');
    } else {
      $header.addEventListener('click', evt => {
        // TODO: Subir a página até onde a matéria se inicia quando o usuário abrir ela
        $header.classList.toggle('subject-header-dark');
        $body.classList.toggle('subject-body-collapse');
      });
    }
  });
}

const updateSubjectStats = $body => {
  // TODO: Ajustar o cálculo de notas para considerar os pesos e as notas substitutivas
  const $exams = $body.querySelectorAll('.subject-grade-wrapper .subject-grade-exam');
  const $assigns = $body.querySelectorAll('.subject-grade-wrapper .subject-grade-assign');

  let partialExams = 0;
  let partialAssigns = 0;
  let finalExams = 0;
  let finalAssigns = 0;

  if ($exams.length) {
    const $partialExams = $body.querySelector('.subject-stat-wrapper .subject-stat-partial-exam');
    const $finalExams = $body.querySelector('.subject-stat-wrapper .subject-stat-final-exam');

    let countExams = 0;
    let sumExams = 0;

    $exams.forEach($exam => {
      if (isNumber($exam.value)) {
        $exam.value = format($exam.value);
        sumExams += parseFloat($exam.value);
        countExams++;
      }
    });

    partialExams = sumExams / (countExams || $exams.length);
    finalExams = sumExams / $exams.length;

    applyGoodOrBadEffectTo(partialExams, $partialExams);
    applyGoodOrBadEffectTo(finalExams, $finalExams);

    $partialExams.innerText = isNaN(partialExams) ? '' : partialExams.toFixed(2);
    $finalExams.innerText = isNaN(finalExams) ? '' : finalExams.toFixed(2);
  }

  if ($assigns.length) {
    const $partialAssigns = $body.querySelector('.subject-stat-wrapper .subject-stat-partial-assign');
    const $finalAssigns = $body.querySelector('.subject-stat-wrapper .subject-stat-final-assign');

    let countAssigns = 0;
    let sumAssigns = 0;

    $assigns.forEach($assign => {
      if (isNumber($assign.value)) {
        $assign.value = format($assign.value);
        sumAssigns += parseFloat($assign.value);
        countAssigns++;
      }
    });

    partialAssigns = sumAssigns / (countAssigns || $assigns.length);
    finalAssigns = sumAssigns / $assigns.length;

    applyGoodOrBadEffectTo(partialAssigns, $partialAssigns);
    applyGoodOrBadEffectTo(finalAssigns, $finalAssigns);

    $partialAssigns.innerText = isNaN(partialAssigns) ? '' : partialAssigns.toFixed(2);
    $finalAssigns.innerText = isNaN(finalAssigns) ? '' : finalAssigns.toFixed(2);
  }

  const partialTotal = (partialExams + partialAssigns) / 2;
  const finalTotal = (finalExams + finalAssigns) / 2;

  const $partialTotal = $body.querySelector('.subject-stat-wrapper .subject-stat-partial-total');
  const $finalTotal = $body.querySelector('.subject-stat-wrapper .subject-stat-final-total');

  applyGoodOrBadEffectTo(partialTotal, $partialTotal);
  applyGoodOrBadEffectTo(finalTotal, $finalTotal);

  $partialTotal.innerText = isNaN(partialTotal) ? '' : partialTotal.toFixed(2);
  $finalTotal.innerText = isNaN(finalTotal) ? '' : finalTotal.toFixed(2);
};

const isNumber = value => {
  return !isNaN(parseFloat(value));
}

const format = grade => {
  return Math.round(Math.min(Math.max(grade, 0), 10) * 2) / 2;
}

const applyGoodOrBadEffectTo = (score, $atTarget) => {
  if (score >= 5.95) {
    $atTarget.classList.remove('class', 'subject-stat-bad');
    $atTarget.classList.add('class', 'subject-stat-good');
  } else {
    $atTarget.classList.remove('class', 'subject-stat-good');
    $atTarget.classList.add('class', 'subject-stat-bad');
  }
}
