const employeeMock = {
  fullName: "Голышманова Ирина Юрьевна",
  role: "Руководитель отдела продаж",
  department: "Отдел №21",
  photo: "/assets/img/bgs/girl_bg.jpg",
  contacts: [
    { type: "email", icon: "/assets/img/bgs/Mail.svg", value: "gayshinets@leto-realty.ru" },
    { type: "phone", icon: "/assets/img/bgs/Phone.svg", value: "8-905-976-99-38" },
    { type: "corp", icon: "/assets/img/bgs/Phone.svg", value: "8-938-441-83-21" }
  ]
};

function renderEmployeeCard(data) {
  const nameEl = document.getElementById("employeeName");
  const roleEl = document.getElementById("employeeRole");
  const deptEl = document.getElementById("employeeDept");
  const photoEl = document.getElementById("employeePhoto");
  const contactsEl = document.getElementById("employeeContacts");
  if (!nameEl || !roleEl || !deptEl || !photoEl || !contactsEl) return;

  nameEl.textContent = data.fullName;
  roleEl.textContent = data.role;
  deptEl.textContent = data.department;
  photoEl.src = data.photo;

  contactsEl.innerHTML = data.contacts
      .map(
          (contact) => `
      <div class="employee-contact" data-type="${contact.type}">
        <div class="employee-contact-icon">
          <img src="${contact.icon}" alt="${contact.type}" />
        </div>
        <div class="employee-contact-text">${contact.value}</div>
      </div>
    `
      )
      .join("");
}

renderEmployeeCard(employeeMock);
