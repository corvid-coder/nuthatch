#version 300 es

in vec3 a_position;
in vec2 a_texCoord;

uniform mat4 u_trans;

out vec2 o_TexCoord;

void main () {
  gl_Position = u_trans * vec4(a_position.x, -a_position.y, 0.0, 1.0);
  o_TexCoord = a_texCoord;
}
