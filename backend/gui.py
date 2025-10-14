import flet as ft

def main(page: ft.Page):
    """Main function for the Flet GUI."""
    page.title = "Image Classification Finetuner"
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
