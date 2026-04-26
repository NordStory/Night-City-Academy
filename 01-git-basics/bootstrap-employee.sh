#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -p "First name (English): " first_name
read -r -p "Last name (English): " last_name
read -r -p "GitHub URL: " github_url
read -r -p "Username (name.lastname): " username
read -r -p "Year joined company [2026]: " joined_year
read -r -p "Employee grade [S-02]: " employee_grade
read -r -p "(не используй реальный пароль!) Temporary password [secure-2077]: " employee_password

joined_year="${joined_year:-2026}"
employee_grade="${employee_grade:-S-02}"
employee_password="${employee_password:-secure-2077}"

full_name="${first_name} ${last_name}"
email="${username}@arasaka.corp"
initials="$(printf "%s%s" "${first_name:0:1}" "${last_name:0:1}" | tr '[:lower:]' '[:upper:]')"

clean_username="${username//./-}"
arasaka_id="NC-$(echo "$clean_username" | tr '[:lower:]' '[:upper:]')-AR"
corp_number="NC-OPS-${#username}$(printf '%02d' "${#first_name}")$(printf '%02d' "${#last_name}")"
bio="Infrastructure-focused corporate operator with active training in version control, Linux systems, networking and platform engineering."

replace_in_file() {
	local file="$1"
	perl -0pi -e '
		s/firstName: \x27.*?\x27/firstName: \x27$ENV{FIRST_NAME}\x27/g;
		s/lastName: \x27.*?\x27/lastName: \x27$ENV{LAST_NAME}\x27/g;
		s/fullName: \x27.*?\x27/fullName: \x27$ENV{FULL_NAME}\x27/g;
		s/username: \x27.*?\x27/username: \x27$ENV{USERNAME}\x27/g;
		s/email: \x27.*?\x27/email: \x27$ENV{EMAIL}\x27/g;
		s/password: \x27.*?\x27/password: \x27$ENV{EMPLOYEE_PASSWORD}\x27/g;
		s/initials: \x27.*?\x27/initials: \x27$ENV{INITIALS}\x27/g;
		s/joinedYear: \x27.*?\x27/joinedYear: \x27$ENV{JOINED_YEAR}\x27/g;
		s/arasakaId: \x27.*?\x27/arasakaId: \x27$ENV{ARASAKA_ID}\x27/g;
		s/grade: \x27.*?\x27/grade: \x27$ENV{EMPLOYEE_GRADE}\x27/g;
		s/githubUrl: \x27.*?\x27/githubUrl: \x27$ENV{GITHUB_URL}\x27/g;
		s/corporateNumber: \x27.*?\x27/corporateNumber: \x27$ENV{CORP_NUMBER}\x27/g;
		s/bio: \x27.*?\x27/bio: \x27$ENV{BIO}\x27/g;
	' "$file"
}

replace_markup() {
	local file="$1"
	perl -0pi -e '
		s|(id="test-operator-email">).*?(</code>)|$1$ENV{EMAIL}$2|g;
		s|(id="test-operator-password">).*?(</code>)|$1$ENV{EMPLOYEE_PASSWORD}$2|g;
		s|(id="employee-initials"[^>]*>).*?(</div>)|$1$ENV{INITIALS}$2|g;
		s|(id="employee-full-name">).*?(</h2>)|$1$ENV{FULL_NAME}$2|g;
		s|(id="employee-summary-line">).*?(</p>)|$1In company since $ENV{JOINED_YEAR} · ARASAKA ID $ENV{ARASAKA_ID} · Grade $ENV{EMPLOYEE_GRADE}$2|g;
		s|(id="employee-bio">).*?(</p>)|$1$ENV{BIO}$2|g;
		s|(id="employee-github">).*?(</p>)|$1$ENV{GITHUB_URL}$2|g;
		s|(id="employee-corp-number">).*?(</p>)|$1$ENV{CORP_NUMBER}$2|g;
		s|(id="employee-email">).*?(</p>)|$1$ENV{EMAIL}$2|g;
	' "$file"
}

export FULL_NAME="$full_name"
export FIRST_NAME="$first_name"
export LAST_NAME="$last_name"
export INITIALS="$initials"
export JOINED_YEAR="$joined_year"
export ARASAKA_ID="$arasaka_id"
export EMPLOYEE_GRADE="$employee_grade"
export GITHUB_URL="$github_url"
export CORP_NUMBER="$corp_number"
export EMAIL="$email"
export EMPLOYEE_PASSWORD="$employee_password"
export BIO="$bio"
export USERNAME="$username"

replace_in_file "${SCRIPT_DIR}/script.js"
replace_markup "${SCRIPT_DIR}/index.html"
replace_markup "${SCRIPT_DIR}/account.html"

printf "\nEmployee profile bootstrapped.\n"
printf "Corporate email: %s\n" "$email"
printf "Temporary password: %s\n" "$employee_password"
