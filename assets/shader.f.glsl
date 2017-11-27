#version 300 es
precision mediump float;

uniform int u_type;
uniform vec4 u_color;
uniform sampler2D u_tex;

int TYPE_SHAPE = 0;
int TYPE_IMAGE = 1;

in vec2 o_TexCoord;

out vec4 o_color;

void main () {
  vec4 t = texture(u_tex, o_TexCoord);
  if (u_type == TYPE_SHAPE) {
    o_color = u_color;
  } else if (u_type == TYPE_IMAGE) {
    //TODO(danny): Add blend modes
    // o_color = t + u_color * t.a;
    o_color = t;
  } else {
    o_color = vec4(1.0, 0.0, 1.0, 1.0);
  }
}
