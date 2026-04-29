const PPDB_ENDPOINT = "https://script.google.com/macros/s/AKfycbw18EI-H034EnBoQD2swZZK1b5oJ2GAfRJuM43kKqwG_Cv9mmoogW9ftRqF4BNqZ2EjIw/exec";
const PPDB_BACKUP_KEY = "ppdbDataBackup";

document.addEventListener("DOMContentLoaded", () => {
  initPpdbForm();
});

async function submitToServer(data) {
  const payload = buildServerPayload(data);
  const formData = buildFormData(payload);
  console.log("Sending data:", payload);

  try {
    const response = await fetch(PPDB_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      body: formData
    });

    const result = {
      status: "submitted",
      type: response.type
    };

    console.log("Response:", result);
    return result;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

function buildServerPayload(data) {
  return {
    namaLengkap: data.namaLengkap,
    nisn: data.nisn,
    tempatLahir: data.tempatLahir,
    tanggalLahir: data.tanggalLahir,
    jenisKelamin: data.jenisKelamin,
    alamat: data.alamat,
    noHp: data.noHp,
    email: data.email,
    pilihanJurusan: data.pilihanJurusan
  };
}

function buildFormData(data) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value ?? "");
  });

  return formData;
}

function saveBackupToLocalStorage(studentData) {
  const storedData = getBackupData();
  storedData.push({
    ...studentData,
    statusPengiriman: "backup-lokal",
    disimpanPada: new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short"
    })
  });
  localStorage.setItem(PPDB_BACKUP_KEY, JSON.stringify(storedData));
}

function getBackupData() {
  try {
    const parsedData = JSON.parse(localStorage.getItem(PPDB_BACKUP_KEY) || "[]");
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error("Gagal membaca backup localStorage:", error);
    return [];
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const htmlEntities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return htmlEntities[char];
  });
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function initPpdbForm() {
  const form = document.getElementById("ppdbForm");
  const confirmationSection = document.getElementById("konfirmasi-ppdb");
  const confirmationData = document.getElementById("confirmationData");
  const submitButton = document.getElementById("submitPpdbBtn");
  const toast = document.getElementById("ppdbToast");
  const fotoInput = document.getElementById("uploadFoto");

  if (!form || !confirmationSection || !confirmationData || !submitButton || !toast || !fotoInput) {
    return;
  }

  const fieldRules = {
    namaLengkap: { label: "Nama Lengkap", required: true },
    nisn: { label: "NISN", required: true, numeric: true },
    tempatLahir: { label: "Tempat Lahir", required: true },
    tanggalLahir: { label: "Tanggal Lahir", required: true },
    jenisKelamin: { label: "Jenis Kelamin", required: true },
    alamat: { label: "Alamat", required: true },
    noHp: { label: "No HP", required: true, phone: true },
    email: { label: "Email", required: true, email: true },
    pilihanJurusan: { label: "Pilihan Jurusan", required: true }
  };

  Object.keys(fieldRules).forEach((fieldName) => {
    const field = form.elements[fieldName];

    if (!field) {
      return;
    }

    const eventName = field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(eventName, () => validateField(fieldName));

    field.addEventListener("blur", () => validateField(fieldName));
  });

  fotoInput.addEventListener("change", () => {
    clearError("uploadFoto");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      focusFirstInvalidField();
      showToast("Mohon lengkapi data yang masih belum valid.");
      return;
    }

    setLoadingState(true);

    const studentData = collectFormData();

    try {
      await submitToServer(studentData);
      renderConfirmation(studentData);
      form.reset();
      clearAllErrors();
      showToast("Pendaftaran berhasil! Data Anda telah tersimpan.");
      window.alert("Pendaftaran berhasil");
      window.location.hash = "konfirmasi-ppdb";
      confirmationSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error("Gagal mengirim data PPDB ke server:", error);
      saveBackupToLocalStorage(studentData);
      showToast("Gagal mengirim ke server. Data disimpan sebagai cadangan di browser.");
      window.alert("Terjadi kesalahan");
    } finally {
      setLoadingState(false);
    }
  });

  function validateForm() {
    let valid = true;

    Object.keys(fieldRules).forEach((fieldName) => {
      const fieldValid = validateField(fieldName);

      if (!fieldValid) {
        valid = false;
      }
    });

    return valid;
  }

  function validateField(fieldName) {
    const rule = fieldRules[fieldName];
    const field = form.elements[fieldName];

    if (!rule || !field) {
      return true;
    }

    const rawValue = field.value || "";
    const value = rawValue.trim();

    if (rule.required && !value) {
      setError(fieldName, `${rule.label} wajib diisi.`);
      return false;
    }

    if (rule.numeric && value && !/^\d+$/.test(value)) {
      setError(fieldName, `${rule.label} hanya boleh berisi angka.`);
      return false;
    }

    if (fieldName === "nisn" && value && value.length < 10) {
      setError(fieldName, "NISN minimal terdiri dari 10 digit.");
      return false;
    }

    if (rule.phone && value && !/^[0-9+\s-]{10,15}$/.test(value)) {
      setError(fieldName, "No HP harus berisi 10 sampai 15 karakter angka.");
      return false;
    }

    if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(fieldName, "Format email belum valid.");
      return false;
    }

    clearError(fieldName);
    return true;
  }

  function collectFormData() {
    const fotoFile = fotoInput.files[0];

    return {
      namaLengkap: form.elements.namaLengkap.value.trim(),
      nisn: form.elements.nisn.value.trim(),
      tempatLahir: form.elements.tempatLahir.value.trim(),
      tanggalLahir: form.elements.tanggalLahir.value,
      jenisKelamin: form.elements.jenisKelamin.value,
      alamat: form.elements.alamat.value.trim(),
      noHp: form.elements.noHp.value.trim(),
      email: form.elements.email.value.trim(),
      pilihanJurusan: form.elements.pilihanJurusan.value,
      uploadFoto: fotoFile ? fotoFile.name : "Tidak ada file",
      dikirimPada: new Date().toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short"
      })
    };
  }

  function renderConfirmation(studentData) {
    const confirmationItems = [
      { label: "Nama Lengkap", value: studentData.namaLengkap },
      { label: "NISN", value: studentData.nisn },
      { label: "Tempat Lahir", value: studentData.tempatLahir },
      { label: "Tanggal Lahir", value: formatDate(studentData.tanggalLahir) },
      { label: "Jenis Kelamin", value: studentData.jenisKelamin },
      { label: "Alamat", value: studentData.alamat },
      { label: "No HP", value: studentData.noHp },
      { label: "Email", value: studentData.email },
      { label: "Pilihan Jurusan", value: studentData.pilihanJurusan },
      { label: "Upload Foto", value: studentData.uploadFoto },
      { label: "Waktu Pengiriman", value: studentData.dikirimPada }
    ];

    confirmationData.innerHTML = confirmationItems
      .map(
        (item) => `
          <div class="confirmation-item">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </div>
        `
      )
      .join("");

    confirmationSection.hidden = false;
  }

  function setError(fieldName, message) {
    const field = form.elements[fieldName];
    const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);
    const fieldWrapper = field ? field.closest(".form-field") : null;

    if (errorElement) {
      errorElement.textContent = message;
    }

    if (fieldWrapper) {
      fieldWrapper.classList.add("has-error");
    }
  }

  function clearError(fieldName) {
    const field = form.elements[fieldName];
    const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);
    const fieldWrapper = field ? field.closest(".form-field") : null;

    if (errorElement) {
      errorElement.textContent = "";
    }

    if (fieldWrapper) {
      fieldWrapper.classList.remove("has-error");
    }
  }

  function clearAllErrors() {
    Object.keys(fieldRules).forEach((fieldName) => clearError(fieldName));
    clearError("uploadFoto");
  }

  function focusFirstInvalidField() {
    const firstInvalid = form.querySelector(".form-field.has-error .form-input");

    if (firstInvalid) {
      firstInvalid.focus();
    }
  }

  function setLoadingState(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
    submitButton.querySelector("[data-submit-label]").textContent = isLoading
      ? "Menyimpan Data..."
      : "Kirim Pendaftaran";
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2600);
  }
}
