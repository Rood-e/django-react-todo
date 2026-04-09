
# 📝 TaskMaster - Full Stack Task Management System

[![Python Version](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![Django Version](https://img.shields.io/badge/django-5.x-green.svg)](https://www.djangoproject.com/)
[![React Version](https://img.shields.io/badge/react-18-61dafb.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TaskMaster is an advanced productivity management ecosystem that combines the power of **Django REST Framework** with the responsiveness of **React**. Built on a containerized architecture, it offers a seamless experience for managing rich-text notes, dynamic checklists, and deadlines, ensuring maximum data security.

---

## 🖼️ Preview
<table>
  <tr>
    <td><b>Dashboard & Calendar</b></td>
    <td><b>Rich-Text Editor</b></td>
  </tr>
  <tr>
    <td><img src="./media/dashboard_calendar_preview.gif" alt="dash_cal"></td>
    <td><img src="./media/text-editor.gif" alt="Editor"></td>
  </tr>
</table>

---

## 🚀 Key Features

### 🎨 Frontend (React + Tailwind CSS)
* **Rich-Text Editor:** Advanced integration with Tiptap (H1, H2, lists, quotes).
* **Calendar View:** FullCalendar for visual and intuitive time management.
* **Dynamic Checklists:** Checklists with data persistence in JSON format.
* **Smart Dashboard:** Real-time filtering by Status, Category, and Type.
* **Modern UI/UX:** Native Dark Mode support and responsive design.

### ⚙️ Backend (Django REST Framework)
* **Multi-Tenant Isolation:** Strict filtering logic; each user accesses only their own records (**Zero-Leakage**).
* **Soft Delete:** “Recycle Bin” system that allows for restoration or permanent deletion.
* **Query Optimization:** Use of `prefetch_related` to resolve the **N+1** problem.
* **Security:** Cross-User validation against **IDOR** attacks and `write_only` parameters in Serializers.

---

## 🛠️ Tech Stack

| Strato | Tecnologie |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, FullCalendar, Tiptap, Framer Motion |
| **Backend** | Python 3.12, Django 5.x, Django REST Framework |
| **Database** | PostgreSQL (Production), SQLite (Dev) |
| **DevOps** | Docker, Docker Compose |

---

## 🐳 Setup con Docker (Consigliato)

1.  **Clona repository:**
    ```bash
    git clone [https://github.com/Rood-e/TaskMaster.git](https://github.com/Rood-e/TaskMaster.git)
    cd TaskMaster
    ```

2.  **Set .env variables:**

3.  **Quick Start:**
    ```bash
    docker-compose up --build
    ```

4.  **Endpoint:**
    * **Frontend:** `http://localhost:5173`
    * **API Backend:** `http://localhost:8000/api/`
    * **Admin Django:** `http://localhost:8000/admin/`

---

## 🔌 API Reference

| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks/` | List of tasks for the logged-in user | Token |
| `POST` | `/api/tasks/` | Create a new task | Token |
| `PATCH` | `/api/tasks/{id}/` | Partial update / Soft delete | Token |
| `GET` | `/api/categories/` | List of categories filtered by user | Token |

---


## 🛡️ Security and Integrity

* **Cross-User Validation:** Server-side protection against **IDOR** (Insecure Direct Object Reference) attacks. Each request verifies that the object belongs to the authenticated user.
* **Password Security:** Use of `write_only` parameters in serializers to prevent leaks of sensitive data in JSON responses.
* **Data Persistence:** Management of Docker volumes to ensure the persistence of the PostgreSQL database even after containers are shut down.
* **Stateless Authentication**: Token-based system (DRF Token Authentication). Security is guaranteed without the use of server-side sessions, making the API scalable and secure.
---

## 🛠️ Current Limitations and Roadmap (Future Features)

The following areas for improvement and planned features have been identified:

* **Stateful Session Management**: Currently, the system uses only Token Authentication (Stateless). We plan to implement server-side sessions and HttpOnly cookies for greater flexibility across various web use cases.
* **Auto-Save System**: Implementation of automatic saving (debounce) after N seconds of inactivity in the Rich-Text editor to prevent accidental data loss.
* **Push Notifications & WebSockets**: Integration with Django Channels for real-time notifications on task deadlines without the need to refresh. 
---

## 👨‍💻 Autore

**Rudy Martucci Ortega**
* **GitHub:** [@Rood-e](https://github.com/Rood-e)
* **LinkedIn:** [Rudy Martucci Ortega](https://www.linkedin.com/in/rudymartucciortega/)

---
*TaskMaster - Designed for professional and secure task management.*
