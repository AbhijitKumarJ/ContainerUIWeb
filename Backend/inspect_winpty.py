from winpty import PtyProcess
import inspect

print("Methods of PtyProcess:")
for name, _ in inspect.getmembers(PtyProcess):
    if not name.startswith("_"):
        print(name)
