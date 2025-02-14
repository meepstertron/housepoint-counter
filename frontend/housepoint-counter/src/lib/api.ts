import $ from "jquery";


const currentdomain = window.location.hostname;

export let apiUrl = "https://api." + currentdomain;


// export let apiUrl = "http://localhost:8080";

export interface User {
    id: string;
    name: string;
    email: string;
    admin: boolean;
}

export interface Student {
    id: number;
    first_name: string;
    last_name: string;
    points: number;
    grad_year: number;
    house: number;
    teacher_name: string;
}

export interface House {
    id: number;
    name: string;
}



// Define a custom type for the return value
interface UserInfoResponse {
    status: string;
    [key: string]: any; // Allows additional properties, if necessary
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    value: number;
}

export interface Log {
    id: number;
    timestamp: string;
    level: string;
    message: string;
    module: string;
    user_id: number | null;
    username: string | null;
    method: string | null;
    url: string | null;
    status_code: number | null;
    stack_trace: string | null;
    ip_address: string | null;
    device: string | null;
}

export async function getUserInfo(userID: number, token: string): Promise<UserInfoResponse> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/userinfo`,
        headers: { 'Authorization': `Bearer ${token}` },
        data: { userid: userID },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to fetch user info"));
        },
      });
    });
}

export async function archivePoints(token: string, reset: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${apiUrl}/api/archive`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      contentType: 'application/json',
      data: JSON.stringify({ resetstats: reset }),
      success: function (result) {
        resolve(result);
      },
      error: function (error) {
        reject(new Error(error.responseText || "Failed to create archive"));
      },
    });
  });
}

export async function getArchived(): Promise<any> {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${apiUrl}/api/archive`,
      method: 'GET',
      success: function (result) {
        resolve(result);
      },
      error: function (error) {
        reject(new Error(error.responseText || "Failed to fetch archives"));
      }
    });
  });
}

export async function getAllStudents(token: string): Promise<Student[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/getstudents`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to fetch students"));
        },
      });
    });
}

export async function searchUsers(query: string, token: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/search_users`,
        headers: { 'Authorization': `Bearer ${token}` },
        data: { query: query },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to search users"));
        },
      });
    });
}

export async function searchTeachers(query: string, token: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/search_teachers`,
        headers: { 'Authorization': `Bearer ${token}` },
        data: { query: query },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to search teachers"));
        },
      });
    });
}

export async function getCurrentUser(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/currentuser`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to fetch current user"));
        },
      });
    });
}

export async function addStudent(student: Student, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/addstudent`,
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        contentType: 'application/json',
        data: JSON.stringify(student),
        success: function () {
          resolve();
        },
        error: function () {
          reject(new Error("Unable to add student"));
        },
      });
    });
}

export async function getAllHouses(token: string): Promise<House[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/gethouses`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to fetch houses"));
        },
      });
    });
}

export async function getHousePoints(houseId: number, token: string): Promise<number> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/gethousepoints`,
        headers: { 'Authorization': `Bearer ${token}` },
        data: { houseId },
        success: function (result) {
          resolve(result.points);
        },
        error: function () {
          reject(new Error("Unable to fetch house points"));
        },
      });
    });
}

export async function addHousePoints(data: { studentId: string, points: string, reason: string }, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/awardpoints`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to award points"));
            },
        });
    });
}

export async function getTopTeachers(token: string): Promise<LeaderboardEntry[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/topteachers`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to fetch top teachers"));
        },
      });
    });
}

export async function getTopStudents(token: string): Promise<LeaderboardEntry[]> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/topstudents`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (result) {
          resolve(result);
        },
        error: function () {
          reject(new Error("Unable to fetch top students"));
        },
      });
    });
}

export async function isAdmin(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${apiUrl}/api/isadmin`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (result) {
          resolve(result.is_admin);
        },
        error: function () {
          reject(new Error("Unable to check admin status"));
        },
      });
    });
}

export async function getAllTeachers(token: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/getteachers`,
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (result) {
                resolve(result);
            },
            error: function () {
                reject(new Error("Unable to fetch teachers"));
            },
        });
    });
}

export async function deleteTeacher(userId: number, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/deleteteacher`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ userId }),
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to delete teacher"));
            },
        });
    });
}


export async function deleteStudent(userId: number, token: string): Promise<void> {
  return new Promise((resolve, reject) => {
      $.ajax({
          url: `${apiUrl}/api/deletestudent`,
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
          contentType: 'application/json',
          data: JSON.stringify({ userId }),
          success: function () {
              resolve();
          },
          error: function () {
              reject(new Error("Unable to delete student"));
          },
      });
  });
}


export async function clearAllHousePoints(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/clearhousepoints`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to clear house points"));
            },
        });
    });
}

export async function deleteAllStudents(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/deleteallstudents`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to delete all students"));
            },
        });
    });
}

export async function addTeacher(data: { name: string, email: string, password: string }, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/addteacher`,
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to add teacher"));
            },
        });
    });
}

export async function deleteAccount(token: string): Promise<void> {
  return new Promise((resolve, reject) => {
      $.ajax({
          url: `${apiUrl}/api/deleteaccount`,
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          success: function () {
              resolve();
          },
          error: function () {
              reject(new Error("Unable to delete account"));
          },
      });
  });
}

export async function getLogs(): Promise<Log[]> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/logs`,
            success: function (result) {
                resolve(result);
            },
            error: function () {
                reject(new Error("Unable to fetch logs"));
            },
        });
    });
}

export async function updateUsername(username: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/editself`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ name: username }),
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to update username"));
            },
        });
    });
}

export async function updateEmail(email: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/editself`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ email: email }),
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to update email"));
            },
        });
    });
}

export async function updatePassword(currentPassword: string, newPassword: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${apiUrl}/api/editself`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ currentPassword: currentPassword, newPassword: newPassword }),
            success: function () {
                resolve();
            },
            error: function () {
                reject(new Error("Unable to update password"));
            },
        });
    });
}

export async function updateStudent(studentData: Student, token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${apiUrl}/api/editstudent`,
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      contentType: 'application/json',
      data: JSON.stringify(studentData),
      success: function () {
        resolve();
      },
      error: function (error) {
        reject(new Error("Unable to update student: " + error.responseText));
      },
    });
  });
}

export async function updateTeacher(teacherData: User, token: string): Promise<void> {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${apiUrl}/api/editteacher`,
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      contentType: 'application/json',
      data: JSON.stringify(teacherData),
      success: function () {
        resolve();
      },
      error: function (error) {
        reject(new Error("Unable to update teacher: " + error.responseText));
      },
    });
  });
}