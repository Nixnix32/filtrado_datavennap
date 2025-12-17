# Proyecto filtrado_datanap
#conexion django y login 
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login

def login_view(request):
    if request.method == "POST":
        usuario = request.POST.get("usuario")
        password = request.POST.get("password")

        user = authenticate(request, username=usuario, password=password)

        if user is not None:
            login(request, user)

            # Redirección según tipo de usuario
            if user.is_superuser:
                return redirect("admin_dashboard")

            elif user.groups.filter(name="Profesores").exists():
                return redirect("profesor_dashboard")

            elif user.groups.filter(name="Estudiantes").exists():
                return redirect("estudiante_dashboard")

            # Si no tiene grupo asignado
            return redirect("home")

        else:
            return render(request, "login.html", {"error": "Credenciales incorrectas"})

    return render(request, "login.html")
