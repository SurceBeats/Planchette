FROM python:3.11-slim

# Python env vars
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# env
ENV HOME="/app" \
    XDG_CONFIG_HOME="/app" \
    XDG_DATA_HOME="/app"

# deps (cmake needed for potential llama-cpp-python fallback build)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# wd
WORKDIR /app

# copy
COPY requirements.txt .
RUN pip install --upgrade pip

# install all deps except llama-cpp-python
RUN grep -v llama-cpp-python requirements.txt | pip install -r /dev/stdin

# install llama-cpp-python: full x86-64-v3 optimization under QEMU (NATIVE=OFF skips CPU detection)
ARG TARGETPLATFORM
RUN if [ "$TARGETPLATFORM" = "linux/amd64" ]; then \
      CMAKE_ARGS="-DGGML_NATIVE=OFF \
        -DGGML_AVX=ON -DGGML_AVX2=ON -DGGML_FMA=ON -DGGML_F16C=ON \
        -DCMAKE_C_FLAGS='-march=x86-64-v3 -mtune=haswell -O3' \
        -DCMAKE_CXX_FLAGS='-march=x86-64-v3 -mtune=haswell -O3'" \
      pip install llama-cpp-python --no-cache-dir; \
    else \
      pip install llama-cpp-python --no-cache-dir; \
    fi

# copy to modify on local
COPY . /app_defaults

# entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# THE EXPOSE!
EXPOSE 7777

# define and command
ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "__main__.py"]
