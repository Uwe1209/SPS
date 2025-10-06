import os
import time
import getpass
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# --- Configuration ---
# Directory to save downloaded files.
# Assumes the script is run from the project root.
DOWNLOAD_DIR = os.path.abspath("iNaturalist/CSV/Protected/Orchidaceae")

def setup_driver():
    """Sets up the Chrome WebDriver with custom download options."""
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)

    chrome_options = Options()
    prefs = {"download.default_directory": DOWNLOAD_DIR}
    chrome_options.add_experimental_option("prefs", prefs)
    
    print(f"Configuring Chrome to download files to: {DOWNLOAD_DIR}")
    
    # Selenium 4+ includes Selenium Manager, which handles chromedriver automatically.
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def login_to_inaturalist(driver):
    """Handles login to iNaturalist using Google OAuth."""
    print("Navigating to iNaturalist login page...")
    driver.get("https://www.inaturalist.org/login")

    wait = WebDriverWait(driver, 10)

    # Handle cookie consent banner first
    try:
        cookie_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "div#cookie-consent button.btn-primary")))
        print("Accepting cookie policy...")
        cookie_button.click()
    except Exception:
        # If the banner is not there, that's fine.
        print("Cookie consent banner not found or already accepted, continuing...")

    try:
        # Find and click the Google login button
        google_login_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='/auth/google_oauth2']")))
        print("Clicking 'Sign in with Google' button...")
        google_login_button.click()
    except Exception as e:
        print("\nError: Could not find or click the 'Sign in with Google' button.")
        print("The iNaturalist login page may have changed, or an overlay is blocking the button.")
        print(f"Selenium error: {e}")
        driver.quit()
        exit()

    print("\n" + "="*50)
    print("Please complete the Google login process in the browser window.")
    print("The script will continue automatically after you log in.")
    print("="*50 + "\n")

    # Wait for the user to be redirected back and logged in.
    # Increase timeout to give user time to log in.
    long_wait = WebDriverWait(driver, 300)  # 5 minutes

    print("Waiting for successful login...")
    try:
        long_wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.user-parent[href*='/people/']")))
        print("Login successful.")
    except Exception:
        print("Login timed out or failed. Please try again.")
        driver.quit()
        exit()

def trigger_and_download_export(driver, year):
    """Triggers an export for a given year and downloads it."""
    base_url = "https://www.inaturalist.org/observations/export"
    taxon_id = 47628  # Orchidaceae
    place_id = 7110   # Sarawak, Malaysia
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    
    query_params = [
        f"taxon_id={taxon_id}",
        f"place_id={place_id}",
        f"d1={start_date}",
        f"d2={end_date}",
        "verifiable=any",
    ]
    
    export_trigger_url = f"{base_url}?{'&'.join(query_params)}"
    
    print(f"\nTriggering export for {year}...")
    driver.get(export_trigger_url)
    
    print("Waiting for export to be prepared...")
    driver.get(base_url)
    
    # Wait up to 10 minutes for the export to be ready.
    wait = WebDriverWait(driver, 600)
    
    try:
        # The newest export is the first one in the list. We wait for the 'Download' link.
        download_link_xpath = "//div[contains(@class, 'stacked')]/table/tbody/tr[1]/td/a[contains(text(), 'Download')]"
        download_link = wait.until(
            EC.presence_of_element_located((By.XPATH, download_link_xpath))
        )
        
        print(f"Export for {year} is ready. Downloading...")
        
        file_url = download_link.get_attribute('href')
        filename = os.path.basename(file_url.split('?')[0])
        
        download_link.click()
        
        wait_for_download_complete(filename, 600)
        print(f"Successfully downloaded {filename} for year {year}.")

    except Exception as e:
        print(f"Could not download export for {year}. It might have timed out. Error: {e}")

def wait_for_download_complete(filename, timeout):
    """Waits for a file to be fully downloaded by checking for temp files."""
    filepath = os.path.join(DOWNLOAD_DIR, filename)
    seconds = 0
    while seconds < timeout:
        # Check if file exists and is not a chrome temp file
        if os.path.exists(filepath) and not any(f.endswith('.crdownload') for f in os.listdir(DOWNLOAD_DIR)):
            time.sleep(2)  # Brief pause to ensure file handle is released
            return True
        time.sleep(1)
        seconds += 1
    print(f"Download timed out for {filename}.")
    return False

def main():
    """Main function to automate iNaturalist exports."""
    print("--- iNaturalist Automated Exporter ---")

    driver = None
    try:
        driver = setup_driver()
        login_to_inaturalist(driver)

        for year in range(2025, 1969, -1):
            trigger_and_download_export(driver, year)

    finally:
        if driver:
            print("\nClosing browser.")
            driver.quit()

    print("-" * 60)
    print("All exports complete.")

if __name__ == "__main__":
    main()
