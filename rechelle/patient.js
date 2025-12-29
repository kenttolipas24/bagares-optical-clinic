// Appointment Management System
class AppointmentManager {
  constructor() {
    this.appointments = this.loadAppointments()
    this.currentStep = 1
    this.currentFilter = "all"
    this.currentEditingId = null
    this.initEventListeners()
    this.setMinDate()
  }

  loadAppointments() {
    const stored = localStorage.getItem("appointments")
    return stored ? JSON.parse(stored) : []
  }

  saveAppointments() {
    localStorage.setItem("appointments", JSON.stringify(this.appointments))
  }

  initEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const view = e.target.dataset.view
        this.switchView(view)
      })
    })

    // Filter tabs
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
        e.target.classList.add("active")
        this.currentFilter = e.target.dataset.filter
        this.renderAppointments()
      })
    })
  }

  setMinDate() {
    const today = new Date().toISOString().split("T")[0]
    const dateInput = document.getElementById("appointmentDate")
    if (dateInput) {
      dateInput.min = today
    }
  }

  switchView(viewName) {
    // Update navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
      if (link.dataset.view === viewName) {
        link.classList.add("active")
      }
    })

    // Update view
    document.querySelectorAll(".view").forEach((view) => {
      view.classList.remove("active")
    })
    document.getElementById(viewName).classList.add("active")

    if (viewName === "manage") {
      this.renderAppointments()
    } else if (viewName === "book") {
      this.currentStep = 1
      this.resetForm()
      this.updateStepIndicator()
    }
  }

  resetForm() {
    document.querySelectorAll(".form-step").forEach((step) => {
      step.classList.remove("active")
    })
    document.getElementById("form-step-1").classList.add("active")
    document.getElementById("appointmentDate").value = ""
    document.getElementById("appointmentTime").value = ""
    document.getElementById("firstName").value = ""
    document.getElementById("middleInitial").value = ""
    document.getElementById("surname").value = ""
    document.getElementById("age").value = ""
    document.getElementById("contactNumber").value = ""
    document.getElementById("address").value = ""
    document.getElementById("email").value = ""
    document.getElementById("notes").value = ""
  }

  nextStep() {
    if (this.validateStep(this.currentStep)) {
      if (this.currentStep === 1) {
        this.updateSummary()
      }
      this.currentStep++
      this.updateFormDisplay()
      this.updateStepIndicator()
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--
      this.updateFormDisplay()
      this.updateStepIndicator()
    }
  }

  validateStep(step) {
    if (step === 1) {
      const date = document.getElementById("appointmentDate").value
      const time = document.getElementById("appointmentTime").value
      if (!date || !time) {
        alert("Please select both date and time")
        return false
      }
    } else if (step === 2) {
      const firstName = document.getElementById("firstName").value.trim()
      const surname = document.getElementById("surname").value.trim()
      const age = document.getElementById("age").value.trim()
      const contactNumber = document.getElementById("contactNumber").value.trim()
      const address = document.getElementById("address").value.trim()
      const email = document.getElementById("email").value.trim()

      if (!firstName || !surname || !age || !contactNumber || !address || !email) {
        alert("Please fill in all required fields")
        return false
      }

      if (!this.isValidEmail(email)) {
        alert("Please enter a valid email address")
        return false
      }
    }
    return true
  }

  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  updateFormDisplay() {
    document.querySelectorAll(".form-step").forEach((step) => {
      step.classList.remove("active")
    })
    document.getElementById(`form-step-${this.currentStep}`).classList.add("active")
  }

  updateStepIndicator() {
    for (let i = 1; i <= 3; i++) {
      const stepIcon = document.getElementById(`step-${i}`)
      const stepTitle = document.getElementById(`step-${i}-title`)

      if (i < this.currentStep) {
        stepIcon.style.background = "var(--success-color)"
        stepIcon.style.color = "var(--white)"
        stepTitle.style.color = "var(--success-color)"
      } else if (i === this.currentStep) {
        stepIcon.style.background = "var(--primary-blue)"
        stepIcon.style.color = "var(--white)"
        stepTitle.style.color = "var(--primary-blue)"
      } else {
        stepIcon.style.background = "rgba(255, 255, 255, 0.2)"
        stepIcon.style.color = "rgba(255, 255, 255, 0.7)"
        stepTitle.style.color = "rgba(255, 255, 255, 0.7)"
      }
    }
  }

  updateSummary() {
    const serviceMap = {
      comprehensive: "Comprehensive Eye Exam",
      followup: "Follow-up Checkup",
      glasses: "Glasses Pickup / Fitting",
    }

    const service = document.querySelector('input[name="service"]:checked').value
    const date = document.getElementById("appointmentDate").value
    const time = document.getElementById("appointmentTime").value
    const firstName = document.getElementById("firstName").value
    const middleInitial = document.getElementById("middleInitial").value
    const surname = document.getElementById("surname").value
    const fullName = `${firstName} ${middleInitial ? middleInitial + " " : ""}${surname}`.trim()
    const age = document.getElementById("age").value
    const contactNumber = document.getElementById("contactNumber").value
    const address = document.getElementById("address").value
    const email = document.getElementById("email").value

    document.getElementById("summary-service").textContent = serviceMap[service]
    document.getElementById("summary-date").textContent = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    document.getElementById("summary-time").textContent = time
    document.getElementById("summary-name").textContent = fullName
    document.getElementById("summary-age").textContent = age
    document.getElementById("summary-address").textContent = address
    document.getElementById("summary-contact").textContent = contactNumber
    document.getElementById("summary-email").textContent = email
  }

  submitAppointment() {
    const serviceMap = {
      comprehensive: "Comprehensive Eye Exam",
      followup: "Follow-up Checkup",
      glasses: "Glasses Pickup / Fitting",
    }

    const firstName = document.getElementById("firstName").value
    const middleInitial = document.getElementById("middleInitial").value
    const surname = document.getElementById("surname").value
    const fullName = `${firstName} ${middleInitial ? middleInitial + " " : ""}${surname}`.trim()

    const appointment = {
      id: Date.now(),
      service: document.querySelector('input[name="service"]:checked').value,
      serviceName: serviceMap[document.querySelector('input[name="service"]:checked').value],
      date: document.getElementById("appointmentDate").value,
      time: document.getElementById("appointmentTime").value,
      firstName: firstName,
      middleInitial: middleInitial,
      surname: surname,
      fullName: fullName,
      age: document.getElementById("age").value,
      contactNumber: document.getElementById("contactNumber").value,
      address: document.getElementById("address").value,
      email: document.getElementById("email").value,
      notes: document.getElementById("notes").value,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    }

    this.appointments.push(appointment)
    this.saveAppointments()

    this.showSuccessModal(
      "Appointment Booked!",
      "Your appointment has been successfully booked. You will receive a confirmation email shortly.",
    )
  }

  renderAppointments() {
    const container = document.getElementById("appointments-list")

    let filtered = this.appointments
    if (this.currentFilter !== "all") {
      filtered = this.appointments.filter((apt) => apt.status === this.currentFilter)
    }

    if (filtered.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><p>No appointments found. <a href="#" onclick="appointmentManager.switchView(\'book\'); return false;">Book your first appointment</a></p></div>'
      return
    }

    container.innerHTML = filtered
      .map((apt) => {
        const appointmentDate = new Date(apt.date)
        const formattedDate = appointmentDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })

        return `
                <div class="appointment-card">
                    <div class="appointment-details">
                        <div class="appointment-status status-${apt.status}">${apt.status.toUpperCase()}</div>
                        <div class="appointment-service">${apt.serviceName}</div>
                        <div class="appointment-info">
                            <div class="info-item">
                                <div class="info-label">Date</div>
                                <div class="info-value">${formattedDate}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Time</div>
                                <div class="info-value">${apt.time}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Patient</div>
                                <div class="info-value">${apt.fullName}</div>
                            </div>
                        </div>
                    </div>
                    <div class="appointment-actions">
                        ${
                          apt.status !== "completed" && apt.status !== "cancelled"
                            ? `
                            <button class="action-btn" onclick="appointmentManager.openRescheduleModal(${apt.id})">Reschedule</button>
                            <button class="action-btn danger" onclick="appointmentManager.openCancelModal(${apt.id})">Cancel</button>
                        `
                            : ""
                        }
                        <button class="action-btn" onclick="appointmentManager.viewDetails(${apt.id})">Details</button>
                    </div>
                </div>
            `
      })
      .join("")
  }

  openRescheduleModal(appointmentId) {
    const appointment = this.appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return

    this.currentEditingId = appointmentId

    const modalBody = document.getElementById("modalBody")
    modalBody.innerHTML = `
            <h2>Reschedule Appointment</h2>
            <p>Choose a new date and time for your appointment.</p>
            
            <div class="modal-form-group">
                <label>New Date</label>
                <input type="date" id="rescheduleDate" value="${appointment.date}">
            </div>
            
            <div class="modal-form-group">
                <label>New Time</label>
                <select id="rescheduleTime">
                    <option value="09:00" ${appointment.time === "09:00" ? "selected" : ""}>9:00 AM</option>
                    <option value="10:00" ${appointment.time === "10:00" ? "selected" : ""}>10:00 AM</option>
                    <option value="11:00" ${appointment.time === "11:00" ? "selected" : ""}>11:00 AM</option>
                    <option value="14:00" ${appointment.time === "14:00" ? "selected" : ""}>2:00 PM</option>
                    <option value="15:00" ${appointment.time === "15:00" ? "selected" : ""}>3:00 PM</option>
                    <option value="16:00" ${appointment.time === "16:00" ? "selected" : ""}>4:00 PM</option>
                </select>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="appointmentManager.closeModal()">Cancel</button>
                <button class="btn btn-primary" onclick="appointmentManager.confirmReschedule()">Reschedule</button>
            </div>
        `

    const today = new Date().toISOString().split("T")[0]
    document.getElementById("rescheduleDate").min = today

    document.getElementById("actionModal").classList.add("active")
  }

  confirmReschedule() {
    const newDate = document.getElementById("rescheduleDate").value
    const newTime = document.getElementById("rescheduleTime").value

    if (!newDate || !newTime) {
      alert("Please select both date and time")
      return
    }

    const appointmentIndex = this.appointments.findIndex((apt) => apt.id === this.currentEditingId)
    if (appointmentIndex !== -1) {
      this.appointments[appointmentIndex].date = newDate
      this.appointments[appointmentIndex].time = newTime
      this.saveAppointments()
      this.closeModal()
      this.renderAppointments()
      this.showSuccessModal("Rescheduled!", "Your appointment has been successfully rescheduled.")
    }
  }

  openCancelModal(appointmentId) {
    this.currentEditingId = appointmentId
    const appointment = this.appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return

    const modalBody = document.getElementById("modalBody")
    modalBody.innerHTML = `
            <h2>Cancel Appointment</h2>
            <p>Are you sure you want to cancel this appointment?</p>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 1rem;">
                <strong>${appointment.serviceName}</strong> on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}
            </p>
            
            <div class="modal-form-group">
                <label>Cancellation Reason (Optional)</label>
                <textarea id="cancellationReason" rows="3" placeholder="Help us improve our service..."></textarea>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="appointmentManager.closeModal()">Keep Appointment</button>
                <button class="btn btn-primary" style="background-color: var(--cancelled-color);" onclick="appointmentManager.confirmCancel()">Cancel Appointment</button>
            </div>
        `

    document.getElementById("actionModal").classList.add("active")
  }

  confirmCancel() {
    const appointmentIndex = this.appointments.findIndex((apt) => apt.id === this.currentEditingId)
    if (appointmentIndex !== -1) {
      this.appointments[appointmentIndex].status = "cancelled"
      this.appointments[appointmentIndex].cancellationReason = document.getElementById("cancellationReason").value
      this.saveAppointments()
      this.closeModal()
      this.renderAppointments()
      this.showSuccessModal("Appointment Cancelled", "Your appointment has been cancelled.")
    }
  }

  viewDetails(appointmentId) {
    const appointment = this.appointments.find((apt) => apt.id === appointmentId)
    if (!appointment) return

    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const modalBody = document.getElementById("modalBody")
    modalBody.innerHTML = `
            <h2>Appointment Details</h2>
            
            <div class="modal-form-group" style="margin-bottom: 1rem;">
                <div style="display: grid; gap: 1rem;">
                    <div>
                        <div class="info-label">Service</div>
                        <div class="info-value">${appointment.serviceName}</div>
                    </div>
                    <div>
                        <div class="info-label">Date</div>
                        <div class="info-value">${formattedDate}</div>
                    </div>
                    <div>
                        <div class="info-label">Time</div>
                        <div class="info-value">${appointment.time}</div>
                    </div>
                    <div>
                        <div class="info-label">Status</div>
                        <div class="info-value" style="color: var(--primary-blue);">${appointment.status.toUpperCase()}</div>
                    </div>
                    <div>
                        <div class="info-label">Patient Name</div>
                        <div class="info-value">${appointment.fullName}</div>
                    </div>
                    <div>
                        <div class="info-label">Age</div>
                        <div class="info-value">${appointment.age}</div>
                    </div>
                    <div>
                        <div class="info-label">Address</div>
                        <div class="info-value">${appointment.address}</div>
                    </div>
                    <div>
                        <div class="info-label">Contact Number</div>
                        <div class="info-value">${appointment.contactNumber}</div>
                    </div>
                    <div>
                        <div class="info-label">Email</div>
                        <div class="info-value">${appointment.email}</div>
                    </div>
                    ${
                      appointment.notes
                        ? `
                        <div>
                            <div class="info-label">Additional Notes</div>
                            <div class="info-value">${appointment.notes}</div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-secondary" style="flex: 1;" onclick="appointmentManager.closeModal()">Close</button>
            </div>
        `

    document.getElementById("actionModal").classList.add("active")
  }

  closeModal() {
    document.getElementById("actionModal").classList.remove("active")
    this.currentEditingId = null
  }

  showSuccessModal(title, message) {
    document.getElementById("successTitle").textContent = title
    document.getElementById("successMessage").textContent = message
    document.getElementById("successModal").classList.add("active")
  }

  successCallback() {
    document.getElementById("successModal").classList.remove("active")
    this.switchView("manage")
  }
}

// Initialize
let appointmentManager

document.addEventListener("DOMContentLoaded", () => {
  appointmentManager = new AppointmentManager()
})

// Global functions for onclick handlers
function switchView(view) {
  appointmentManager.switchView(view)
}

function nextStep() {
  appointmentManager.nextStep()
}

function prevStep() {
  appointmentManager.prevStep()
}

function submitAppointment() {
  appointmentManager.submitAppointment()
}

function closeModal() {
  appointmentManager.closeModal()
}

function successCallback() {
  appointmentManager.successCallback()
}
