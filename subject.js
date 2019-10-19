// called when a subject is clicked
const expand = (sub, head, info) => {
    if (document.body.offsetWidth >= 760) return;

    info.classList.toggle("subject-collapse");
    head.classList.toggle("subject-bg-orange");    
    sub.classList.toggle("subject-open");
};

// called to calculate statistics based on currently inserted grades
// also guarantees no incoherent values are inserted
const update = (item, pr, tr) => {
    const checkNumber = (num) => {
        return !isNaN(parseFloat(num));
    }

    const clamp = (num) => {
        return Math.min(Math.max(num, 0), 10);
    }

    // count variables are used to check how many boxes have valid inputs
    let countP = 0;
    let countT = 0;

    let sumP = 0;
    let sumT = 0;

    // get subs and their values
    const ps1 = item.querySelectorAll(".subject-ps")[0];
    const ps2 = item.querySelectorAll(".subject-ps")[1];

    let ps1val = 0;
    let ps2val = 0;

    if(checkNumber(ps1.value)) ps1val = clamp(ps1.value);

    if(checkNumber(ps2.value)) ps2val = clamp(ps2.value);

    pr.forEach(e => {
        if(checkNumber(e.value)) {
            e.value = clamp(e.value);
            countP++;
            // check if sub value is greater than normal exam value
            if((e.name === "P1" || e.name === "P2") & ps1val > parseFloat(e.value)){
                sumP += ps1val;
            } else if ((e.name === "P3" || e.name === "P4") & ps2val > parseFloat(e.value)){
                sumP += ps2val;
            } else {
                sumP += parseFloat(e.value);
            }
        }
    });

    tr.forEach(e => {
        if(checkNumber(e.value)) {
            e.value = clamp(e.value);
            countT++;
            sumT += parseFloat(e.value);
        }
    });

    // round, multiplication and division are used to display one decimal at most
    const partialP = Math.round(sumP / countP * 10) / 10;
    const partialT = Math.round(sumT / countT * 10) / 10;
    const finalP = Math.round(sumP / pr.length * 10) / 10;
    const finalT = Math.round(sumT / tr.length * 10) / 10;
    const partialTotal = Math.round((partialP + partialT) / 2 * 10) / 10;
    const finalTotal = Math.round((finalP + finalT) / 2 * 10) / 10;

    // in the case of no inserted values, the partial will divide by zero and result in a NaN
    // if that happens, check for a NaN and set the result to "?" instead
    item.querySelector(".subject-p-partial").innerText = isNaN(partialP) ? "?" : partialP;
    item.querySelector(".subject-t-partial").innerText = isNaN(partialT) ? "?" : partialT;
    item.querySelector(".subject-p-final").innerText = finalP;
    item.querySelector(".subject-t-final").innerText = finalT;
    item.querySelector(".subject-total-partial").innerText = isNaN(partialTotal) ? "?" : partialTotal;
    item.querySelector(".subject-total-final").innerText = finalTotal;
};

// all subjects currently in the page
const subjects = Array.from(document.querySelectorAll(".subject"));

subjects.forEach(parent => {
    const title = parent.querySelector(".subject-title"); // grab subject name
    const grades = parent.querySelector(".subject-inside"); // grab grades & statistics

    const p = Array.from(parent.getElementsByClassName("subject-p")); // grab all "provas"
    const t = Array.from(parent.getElementsByClassName("subject-t")); // grab all "trabalhos"

    title.addEventListener("click", () => {
        expand(parent, title, grades);
    });

    // updates the calculated statistics whenever an input box changes
    grades.addEventListener("input", (e) => {
        update(grades, p, t);
    });
});

function on_resize(c,t){onresize=function(){clearTimeout(t);t=setTimeout(c,100)};return c};
on_resize(function() {
    Array.from(document.getElementsByClassName("subject")).forEach( sub => {
        if (document.body.offsetWidth >= 760) {
            sub.classList.add("subject-open");
            sub.getElementsByClassName("subject-inside")[0].classList.remove("subject-collapse");
            sub.getElementsByClassName("subject-title")[0].classList.add("subject-bg-orange");
        }
        else {
            sub.classList.remove("subject-open");
            sub.getElementsByClassName("subject-inside")[0].classList.add("subject-collapse");
            sub.getElementsByClassName("subject-title")[0].classList.remove("subject-bg-orange");
        }
    });
})();