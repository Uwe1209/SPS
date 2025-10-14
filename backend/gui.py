import flet as ft

def main(page: ft.Page):
    """Main function for the Flet GUI."""
    page.title = "Image Classification Finetuner"
    page.add(
        ft.Dropdown(
            label="Select Model",
            options=[
                ft.dropdown.Option("resnet18"),
                ft.dropdown.Option("vgg16"),
                ft.dropdown.Option("alexnet"),
                ft.dropdown.Option("googlenet"),
            ],
        )
    )
    page.update()

if __name__ == "__main__":
    ft.app(target=main)
